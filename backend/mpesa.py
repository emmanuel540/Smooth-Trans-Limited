import base64
import logging
from datetime import datetime
import requests
from requests.auth import HTTPBasicAuth
from flask import current_app

logger = logging.getLogger(__name__)

class MpesaClient:
    def __init__(self):
        # Configuration is fetched dynamically inside methods using current_app context
        pass

    def _get_config(self):
        config = current_app.config
        return {
            'env': config.get('MPESA_ENVIRONMENT', 'sandbox'),
            'consumer_key': config.get('MPESA_CONSUMER_KEY', ''),
            'consumer_secret': config.get('MPESA_CONSUMER_SECRET', ''),
            'shortcode': config.get('MPESA_SHORTCODE', '174379'),
            'passkey': config.get('MPESA_PASSKEY', ''),
            'callback_url': config.get('MPESA_CALLBACK_URL', '')
        }

    def _get_base_url(self):
        cfg = self._get_config()
        if cfg['env'] == 'production':
            return 'https://api.safaricom.co.ke'
        return 'https://sandbox.safaricom.co.ke'

    def get_access_token(self):
        cfg = self._get_config()
        
        # Check if credentials are placeholder or empty
        if not cfg['consumer_key'] or 'YOUR_DARAJA' in cfg['consumer_key'] or not cfg['consumer_secret'] or 'YOUR_DARAJA' in cfg['consumer_secret']:
            logger.warning("M-Pesa credentials not configured. Returning dummy access token.")
            return "dummy_access_token"

        base_url = self._get_base_url()
        url = f"{base_url}/oauth/v1/generate?grant_type=client_credentials"
        
        try:
            response = requests.get(
                url, 
                auth=HTTPBasicAuth(cfg['consumer_key'], cfg['consumer_secret']),
                timeout=10
            )
            response.raise_for_status()
            data = response.json()
            return data.get('access_token')
        except Exception as e:
            logger.error(f"Error fetching M-Pesa access token: {e}")
            raise e

    def initiate_stk_push(self, phone_number, amount, invoice_no):
        cfg = self._get_config()
        
        # Validate phone number
        # Phone number must be in 2547XXXXXXXX or 2541XXXXXXXX format
        clean_phone = str(phone_number).strip().replace("+", "")
        if clean_phone.startswith("0"):
            clean_phone = "254" + clean_phone[1:]
        elif clean_phone.startswith("7") or clean_phone.startswith("1"):
            clean_phone = "254" + clean_phone
            
        if not (clean_phone.startswith("254") and len(clean_phone) == 12):
            raise ValueError(f"Invalid phone number format: {phone_number}. Must be in format 2547XXXXXXXX, 2541XXXXXXXX, 07XXXXXXXX, 01XXXXXXXX")

        # Round amount to nearest integer (Daraja Sandbox works best with integers, but decimals are fine)
        amount_int = int(round(float(amount)))
        if amount_int <= 0:
            amount_int = 1 # Fallback to 1 KES minimum for testing

        # Check for placeholder/empty configurations to fallback to mock mode
        is_mock_mode = (
            not cfg['consumer_key'] or 
            'YOUR_DARAJA' in cfg['consumer_key'] or 
            not cfg['consumer_secret'] or 
            'YOUR_DARAJA' in cfg['consumer_secret'] or 
            not cfg['passkey'] or
            'YOUR_DARAJA' in cfg['passkey']
        )

        if is_mock_mode:
            logger.warning("M-Pesa credentials not set. Simulating STK push initiation.")
            # Return dummy checkout details
            import uuid
            checkout_id = f"ws_CO_{uuid.uuid4().hex[:16]}"
            merchant_id = f"22100-{uuid.uuid4().hex[:8]}"
            return {
                'success': True,
                'is_mock': True,
                'CheckoutRequestID': checkout_id,
                'MerchantRequestID': merchant_id,
                'ResponseDescription': "Success. Request accepted for processing (Simulated)",
                'CustomerMessage': "Simulated STK Push initiated successfully."
            }

        # Authentic Daraja integration
        access_token = self.get_access_token()
        base_url = self._get_base_url()
        url = f"{base_url}/mpesa/stkpush/v1/processrequest"

        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        password_str = f"{cfg['shortcode']}{cfg['passkey']}{timestamp}"
        password = base64.b64encode(password_str.encode()).decode('utf-8')

        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }

        payload = {
            "BusinessShortCode": int(cfg['shortcode']),
            "Password": password,
            "Timestamp": timestamp,
            "TransactionType": "CustomerPayBillOnline",
            "Amount": amount_int,
            "PartyA": int(clean_phone),
            "PartyB": int(cfg['shortcode']),
            "PhoneNumber": int(clean_phone),
            "CallBackURL": cfg['callback_url'],
            "AccountReference": invoice_no,
            "TransactionDesc": f"Pay Booking {invoice_no}"
        }

        try:
            response = requests.post(url, json=payload, headers=headers, timeout=15)
            response.raise_for_status()
            data = response.json()
            # Safaricom response code "0" indicates success in processing request initiation
            response_code = data.get('ResponseCode')
            success = response_code == "0"
            return {
                'success': success,
                'is_mock': False,
                'CheckoutRequestID': data.get('CheckoutRequestID'),
                'MerchantRequestID': data.get('MerchantRequestID'),
                'ResponseDescription': data.get('ResponseDescription'),
                'CustomerMessage': data.get('CustomerMessage')
            }
        except Exception as e:
            logger.error(f"Error initiating STK push: {e}")
            raise e
