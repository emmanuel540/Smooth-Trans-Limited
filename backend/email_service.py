import os
import resend
from dotenv import load_dotenv

load_dotenv()

resend.api_key = os.environ.get('RESEND_API_KEY', '')
EMAIL_FROM = os.environ.get('EMAIL_FROM', 'onboarding@resend.dev')


def send_password_reset_email(to_email, user_name, reset_token):
    """Send a password reset email with the reset token."""
    if not resend.api_key:
        print("[EMAIL] WARNING: RESEND_API_KEY not set. Skipping email send.")
        return False

    try:
        resend.Emails.send({
            "from": f"Smooth Trans <{EMAIL_FROM}>",
            "to": [to_email],
            "subject": "Reset Your Password - Smooth Trans",
            "html": f"""
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #0F1B2D;">Password Reset Request</h2>
                <p>Hi {user_name},</p>
                <p>You requested a password reset for your Smooth Trans account.</p>
                <div style="background: #F1F5F9; border-radius: 8px; padding: 16px; margin: 20px 0; text-align: center;">
                    <p style="margin: 0; color: #64748B; font-size: 14px;">Your reset token:</p>
                    <p style="margin: 8px 0 0; font-size: 20px; font-weight: bold; color: #0F1B2D; letter-spacing: 2px;">{reset_token}</p>
                </div>
                <p style="color: #64748B; font-size: 14px;">This token expires in <strong>1 hour</strong>.</p>
                <p style="color: #64748B; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
                <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 20px 0;" />
                <p style="color: #94A3B8; font-size: 12px;">Smooth Trans Limited - Sophisticated Utility in Motion</p>
            </div>
            """
        })
        print(f"[EMAIL] Password reset email sent to {to_email}")
        return True
    except Exception as e:
        print(f"[EMAIL] ERROR: Failed to send password reset email: {e}")
        return False


def send_verification_email(to_email, user_name, verification_code):
    """Send an email verification code."""
    if not resend.api_key:
        print("[EMAIL] WARNING: RESEND_API_KEY not set. Skipping email send.")
        return False

    try:
        resend.Emails.send({
            "from": f"Smooth Trans <{EMAIL_FROM}>",
            "to": [to_email],
            "subject": "Verify Your Email - Smooth Trans",
            "html": f"""
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #0F1B2D;">Email Verification</h2>
                <p>Hi {user_name},</p>
                <p>Welcome to Smooth Trans! Please verify your email address.</p>
                <div style="background: #F1F5F9; border-radius: 8px; padding: 16px; margin: 20px 0; text-align: center;">
                    <p style="margin: 0; color: #64748B; font-size: 14px;">Your verification code:</p>
                    <p style="margin: 8px 0 0; font-size: 28px; font-weight: bold; color: #0F1B2D; letter-spacing: 4px;">{verification_code}</p>
                </div>
                <p style="color: #64748B; font-size: 14px;">This code expires in <strong>15 minutes</strong>.</p>
                <p style="color: #64748B; font-size: 14px;">If you didn't create an account, you can safely ignore this email.</p>
                <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 20px 0;" />
                <p style="color: #94A3B8; font-size: 12px;">Smooth Trans Limited - Sophisticated Utility in Motion</p>
            </div>
            """
        })
        print(f"[EMAIL] Verification email sent to {to_email}")
        return True
    except Exception as e:
        print(f"[EMAIL] ERROR: Failed to send verification email: {e}")
        return False
