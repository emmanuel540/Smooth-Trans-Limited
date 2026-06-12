from flask import Blueprint, request, jsonify
from backend.models import db, Payment, Booking, Notification, User
from flask_jwt_extended import jwt_required, get_jwt_identity
import random
import time

payments_bp = Blueprint('payments', __name__)

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

    # Simulating STK Push or Card processing delay
    time.sleep(1) # Simple mock delay
    
    # Randomly complete payment successfully (95% success rate for simulation realism)
    success = random.random() < 0.98
    if success:
        payment.status = 'Completed'
        payment.payment_method = payment_method
        payment.transaction_id = f"TXN{random.randint(100000000, 999999999)}"
        
        # Notify passenger
        notif = Notification(
            user_id=booking.customer_id,
            message=f"Payment of KES {booking.fare} for Booking #{booking.id} was successful. Transaction ID: {payment.transaction_id}.",
            type="SMS"
        )
        db.session.add(notif)
    else:
        payment.status = 'Failed'
        notif = Notification(
            user_id=booking.customer_id,
            message=f"Payment of KES {booking.fare} for Booking #{booking.id} failed. Please try again.",
            type="SMS"
        )
        db.session.add(notif)

    db.session.commit()

    if payment.status == 'Completed':
        return jsonify({
            'message': 'Payment processed successfully',
            'status': 'Success',
            'payment': payment.to_dict()
        }), 200
    else:
        return jsonify({
            'message': 'Payment failed. Please retry.',
            'status': 'Failed',
            'payment': payment.to_dict()
        }), 400

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
