from flask import Blueprint, request, jsonify
from backend.models import db, Payment, Booking, Notification, User
from backend.mpesa import MpesaClient
from flask_jwt_extended import jwt_required, get_jwt_identity
import random
import time

payments_bp = Blueprint('payments', __name__)
mpesa_client = MpesaClient()


@payments_bp.route('/pay', methods=['POST'])
@jwt_required()
def process_payment():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}
    booking_id = data.get('booking_id')
    payment_method = data.get('payment_method', 'MPesa') # MPesa, Card
    phone_number = data.get('phone_number') # Required for MPesa
    card_number = data.get('card_number') # Required for Card

    if not booking_id:
        return jsonify({'message': 'Booking ID is required'}), 400

    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({'message': 'Booking not found'}), 404

    # Ensure booking belongs to passenger
    user = User.query.get(user_id)
    if user.role == 'passenger' and booking.customer_id != user_id:
        return jsonify({'message': 'Unauthorized'}), 403

    payment = Payment.query.filter_by(booking_id=booking_id).first()
    if not payment:
        invoice_no = f"INV-{booking.id}-{random.randint(1000, 9999)}"
        payment = Payment(
            booking_id=booking_id,
            amount=booking.fare,
            payment_method=payment_method,
            status='Pending',
            invoice_no=invoice_no
        )
        db.session.add(payment)
        db.session.flush()

    if payment.status == 'Completed':
        return jsonify({'message': 'This booking is already paid', 'payment': payment.to_dict()}), 200

    if payment_method == 'MPesa':
        if not phone_number:
            return jsonify({'message': 'Phone number is required for M-Pesa payments'}), 400
            
        try:
            res = mpesa_client.initiate_stk_push(phone_number, booking.fare, payment.invoice_no)
            if res.get('success'):
                # Update checkout request ID and save
                payment.status = 'Pending'
                payment.payment_method = 'MPesa'
                payment.checkout_request_id = res.get('CheckoutRequestID')
                payment.merchant_request_id = res.get('MerchantRequestID')
                db.session.commit()
                
                is_mock = res.get('is_mock', False)
                
                return jsonify({
                    'message': res.get('CustomerMessage') or 'M-Pesa STK Push initiated successfully.',
                    'status': 'Pending',
                    'is_mock': is_mock,
                    'checkout_request_id': payment.checkout_request_id,
                    'payment': payment.to_dict()
                }), 200
            else:
                payment.status = 'Failed'
                db.session.commit()
                return jsonify({
                    'message': res.get('ResponseDescription') or 'Failed to initiate M-Pesa STK Push.',
                    'status': 'Failed',
                    'payment': payment.to_dict()
                }), 400
        except Exception as e:
            payment.status = 'Failed'
            db.session.commit()
            return jsonify({
                'message': f'M-Pesa transaction failed to initiate: {str(e)}',
                'status': 'Failed',
                'payment': payment.to_dict()
            }), 500

    else:
        # Card processing or other mock billing
        time.sleep(1) # Simple mock delay
        success = random.random() < 0.98
        if success:
            payment.status = 'Completed'
            payment.payment_method = payment_method
            payment.transaction_id = f"TXN{random.randint(100000000, 999999999)}"
            
            notif = Notification(
                user_id=booking.customer_id,
                message=f"Payment of KES {booking.fare} for Booking #{booking.id} was successful. Transaction ID: {payment.transaction_id}.",
                type="SMS"
            )
            db.session.add(notif)
            db.session.commit()
            
            return jsonify({
                'message': 'Payment processed successfully',
                'status': 'Success',
                'payment': payment.to_dict()
            }), 200
        else:
            payment.status = 'Failed'
            notif = Notification(
                user_id=booking.customer_id,
                message=f"Payment of KES {booking.fare} for Booking #{booking.id} failed. Please try again.",
                type="SMS"
            )
            db.session.add(notif)
            db.session.commit()
            
            return jsonify({
                'message': 'Payment failed. Please retry.',
                'status': 'Failed',
                'payment': payment.to_dict()
            }), 400

@payments_bp.route('/callback', methods=['POST'])
def mpesa_callback():
    data = request.get_json() or {}
    print("Received M-Pesa Callback:", data)
    
    body = data.get('Body', {})
    stk_callback = body.get('stkCallback', {})
    
    checkout_request_id = stk_callback.get('CheckoutRequestID')
    result_code = stk_callback.get('ResultCode')
    result_desc = stk_callback.get('ResultDesc')
    
    if not checkout_request_id:
        return jsonify({'message': 'Invalid callback data'}), 400
        
    payment = Payment.query.filter_by(checkout_request_id=checkout_request_id).first()
    if not payment:
        return jsonify({'message': 'Payment record not found'}), 404
        
    booking = Booking.query.get(payment.booking_id)
    
    if result_code == 0:
        payment.status = 'Completed'
        metadata = stk_callback.get('CallbackMetadata', {})
        items = metadata.get('Item', [])
        receipt_no = None
        for item in items:
            if item.get('Name') == 'MpesaReceiptNumber':
                receipt_no = item.get('Value')
                break
        
        payment.transaction_id = receipt_no or f"MPESA{random.randint(10000000, 99999999)}"
        
        if booking:
            notif = Notification(
                user_id=booking.customer_id,
                message=f"Payment of KES {booking.fare} for Booking #{booking.id} was successful. Transaction ID: {payment.transaction_id}.",
                type="SMS"
            )
            db.session.add(notif)
    else:
        payment.status = 'Failed'
        if booking:
            notif = Notification(
                user_id=booking.customer_id,
                message=f"Payment of KES {booking.fare} for Booking #{booking.id} failed: {result_desc}.",
                type="SMS"
            )
            db.session.add(notif)
            
    db.session.commit()
    return jsonify({'ResultCode': 0, 'ResultDesc': 'Success'}), 200

@payments_bp.route('/status/<int:booking_id>', methods=['GET'])
@jwt_required()
def check_payment_status(booking_id):
    user_id = int(get_jwt_identity())
    
    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({'message': 'Booking not found'}), 404
        
    user = User.query.get(user_id)
    if user.role == 'passenger' and booking.customer_id != user_id:
        return jsonify({'message': 'Unauthorized'}), 403
        
    payment = Payment.query.filter_by(booking_id=booking_id).first()
    if not payment:
        return jsonify({'status': 'Unpaid', 'message': 'No payment initiated'}), 200
        
    return jsonify({
        'status': payment.status,
        'checkout_request_id': payment.checkout_request_id,
        'transaction_id': payment.transaction_id,
        'payment': payment.to_dict()
    }), 200

@payments_bp.route('/callback-mock', methods=['POST'])
def mpesa_callback_mock():
    data = request.get_json() or {}
    checkout_request_id = data.get('checkout_request_id')
    status = data.get('status', 'Completed')
    
    if not checkout_request_id:
        return jsonify({'message': 'CheckoutRequestID is required'}), 400
        
    payment = Payment.query.filter_by(checkout_request_id=checkout_request_id).first()
    if not payment:
        return jsonify({'message': 'Payment record not found'}), 404
        
    booking = Booking.query.get(payment.booking_id)
    
    if status == 'Completed':
        payment.status = 'Completed'
        payment.transaction_id = f"QW{random.randint(10, 99)}A{random.randint(1000, 9999)}"
        if booking:
            notif = Notification(
                user_id=booking.customer_id,
                message=f"[Mock] Payment of KES {booking.fare} for Booking #{booking.id} was successful. Transaction ID: {payment.transaction_id}.",
                type="SMS"
            )
            db.session.add(notif)
    else:
        payment.status = 'Failed'
        if booking:
            notif = Notification(
                user_id=booking.customer_id,
                message=f"[Mock] Payment of KES {booking.fare} for Booking #{booking.id} failed: User cancelled transaction.",
                type="SMS"
            )
            db.session.add(notif)
            
    db.session.commit()
    return jsonify({
        'message': f'Mock callback processed with status: {status}',
        'payment': payment.to_dict()
    }), 200

@payments_bp.route('/history', methods=['GET'])
@jwt_required()
def payment_history():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404

    if user.role == 'passenger':
        payments = Payment.query.join(Booking).filter(Booking.customer_id == user_id).order_by(Payment.created_at.desc()).all()
    elif user.role == 'driver':
        payments = Payment.query.join(Booking).filter(Booking.driver_id == user_id).order_by(Payment.created_at.desc()).all()
    else: # Admin, Dispatcher
        payments = Payment.query.order_by(Payment.created_at.desc()).all()

    return jsonify([p.to_dict() for p in payments]), 200

@payments_bp.route('/<int:booking_id>/receipt', methods=['GET'])
@jwt_required()
def get_receipt(booking_id):
    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({'message': 'Booking not found'}), 404

    payment = Payment.query.filter_by(booking_id=booking_id).first()
    if not payment:
        return jsonify({'message': 'No payment found for this booking'}), 404

    # Build invoice details JSON
    return jsonify({
        'invoice_no': payment.invoice_no,
        'transaction_id': payment.transaction_id,
        'amount': payment.amount,
        'payment_method': payment.payment_method,
        'payment_status': payment.status,
        'date': payment.created_at.isoformat() if payment.created_at else None,
        'booking': booking.to_dict()
    }), 200
