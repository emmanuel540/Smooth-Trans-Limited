from flask import Blueprint, request, jsonify
from backend.models import db, DriverProfile, User, Booking
from flask_jwt_extended import jwt_required, get_jwt_identity

drivers_bp = Blueprint('drivers', __name__)

@drivers_bp.route('', methods=['GET'])
@jwt_required()
def get_drivers():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if user.role not in ['admin', 'dispatcher']:
        return jsonify({'message': 'Unauthorized'}), 403

    drivers = DriverProfile.query.all()
    return jsonify([d.to_dict() for d in drivers]), 200

@drivers_bp.route('/available', methods=['GET'])
@jwt_required()
def get_available_drivers():
    # Fetch drivers who are Available
    drivers = DriverProfile.query.filter_by(status='Available').all()
    return jsonify([d.to_dict() for d in drivers]), 200

@drivers_bp.route('/<int:driver_id>/status', methods=['PUT'])
@jwt_required()
def update_driver_status(driver_id):
    # Driver can update their own status, admin/dispatcher can update any
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404

    driver_profile = DriverProfile.query.filter_by(user_id=driver_id).first()
    if not driver_profile:
        return jsonify({'message': 'Driver profile not found'}), 404

    if user.role == 'driver' and driver_profile.user_id != user_id:
        return jsonify({'message': 'Unauthorized'}), 403

    data = request.get_json() or {}
    new_status = data.get('status') # Available, Active, Offline
    if new_status not in ['Available', 'Active', 'Offline']:
        return jsonify({'message': 'Invalid status'}), 400

    driver_profile.status = new_status
    db.session.commit()
    return jsonify({'message': 'Driver status updated successfully', 'driver': driver_profile.to_dict()}), 200

@drivers_bp.route('/<int:driver_id>/rating', methods=['POST'])
@jwt_required()
def rate_driver(driver_id):
    # Customer can rate their driver
    data = request.get_json() or {}
    rating = data.get('rating') # float 1-5

    if rating is None or not (1 <= float(rating) <= 5):
        return jsonify({'message': 'Rating must be between 1 and 5'}), 400

    driver_profile = DriverProfile.query.filter_by(user_id=driver_id).first()
    if not driver_profile:
        return jsonify({'message': 'Driver not found'}), 404

    # Calculate new average rating
    old_rating = driver_profile.rating
    # Simple rolling average logic, or simulate a gradual shift
    driver_profile.rating = round((old_rating * 4 + float(rating)) / 5, 2)
    db.session.commit()

    return jsonify({'message': 'Driver rated successfully', 'new_rating': driver_profile.rating}), 200
