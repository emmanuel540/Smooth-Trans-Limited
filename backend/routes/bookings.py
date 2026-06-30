from flask import Blueprint, request, jsonify
from datetime import datetime
import math
from backend.models import db, Booking, User, DriverProfile, Vehicle, Payment, Notification
from flask_jwt_extended import jwt_required, get_jwt_identity

bookings_bp = Blueprint('bookings', __name__)

def calculate_distance(lat1, lng1, lat2, lng2):
    # Quick approximation of distance in km on a plane
    return math.sqrt((lat2 - lat1)**2 + (lng2 - lng1)**2) * 111.0

@bookings_bp.route('/estimate', methods=['POST'])
def estimate_fare():
    data = request.get_json() or {}
    pickup_coords = data.get('pickup_coords') # {'lat': ..., 'lng': ...}
    dropoff_coords = data.get('dropoff_coords') # {'lat': ..., 'lng': ...}
    booking_type = data.get('booking_type', 'General') # General, School, Delivery, Moving

    if not pickup_coords or not dropoff_coords:
        return jsonify({'message': 'Pickup and dropoff coordinates are required'}), 400

    lat1, lng1 = pickup_coords.get('lat'), pickup_coords.get('lng')
    lat2, lng2 = dropoff_coords.get('lat'), dropoff_coords.get('lng')

    if None in (lat1, lng1, lat2, lng2):
        return jsonify({'message': 'Invalid coordinates'}), 400

    distance_km = calculate_distance(lat1, lng1, lat2, lng2)

    # Rates based on booking type
    rates = {
        'General': {'base': 50, 'per_km': 10},
        'School': {'base': 1000, 'per_km': 30},
        'Delivery': {'base': 100, 'per_km': 40},
        'Moving': {'base': 3000, 'per_km': 150}
    }

    type_rate = rates.get(booking_type, rates['General'])
    fare = type_rate['base'] + (distance_km * type_rate['per_km'])
    # Round to nearest 10
    fare = round(fare, -1)

    return jsonify({
        'distance_km': round(distance_km, 2),
        'fare': fare,
        'booking_type': booking_type
    }), 200

@bookings_bp.route('', methods=['POST'])
@jwt_required()
def create_booking():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}

    booking_type = data.get('booking_type')
    pickup_address = data.get('pickup_address')
    dropoff_address = data.get('dropoff_address')
    pickup_coords = data.get('pickup_coords', {})
    dropoff_coords = data.get('dropoff_coords', {})
    pickup_time_str = data.get('pickup_time')
    payment_method = data.get('payment_method', 'MPesa')

    if not all([booking_type, pickup_address, dropoff_address, pickup_coords, dropoff_coords]):
        return jsonify({'message': 'Missing booking fields'}), 400

    # Calculate fare
    lat1, lng1 = pickup_coords.get('lat'), pickup_coords.get('lng')
    lat2, lng2 = dropoff_coords.get('lat'), dropoff_coords.get('lng')
    distance_km = calculate_distance(lat1, lng1, lat2, lng2)
    
    rates = {
        'General': {'base': 50, 'per_km': 10},
        'School': {'base': 1000, 'per_km': 30},
        'Delivery': {'base': 100, 'per_km': 40},
        'Moving': {'base': 3000, 'per_km': 150}
    }
    type_rate = rates.get(booking_type, rates['General'])
    fare = round(type_rate['base'] + (distance_km * type_rate['per_km']), -1)

    try:
        pickup_time = datetime.fromisoformat(pickup_time_str) if pickup_time_str else datetime.utcnow()
    except ValueError:
        pickup_time = datetime.utcnow()

    # Create booking
    new_booking = Booking(
        customer_id=user_id,
        booking_type=booking_type,
        pickup_address=pickup_address,
        dropoff_address=dropoff_address,
        pickup_lat=lat1,
        pickup_lng=lng1,
        dropoff_lat=lat2,
        dropoff_lng=lng2,
        pickup_time=pickup_time,
        fare=fare,
        status='Pending'
    )

    db.session.add(new_booking)
    db.session.flush() # get booking.id

    # Create associated payment invoice
    import random
    invoice_no = f"INV-{new_booking.id}-{random.randint(1000, 9999)}"
    new_payment = Payment(
        booking_id=new_booking.id,
        amount=fare,
        payment_method=payment_method,
        status='Pending',
        invoice_no=invoice_no
    )
    db.session.add(new_payment)

    # Try to auto-assign a driver and vehicle
    # Map booking type to vehicle type
    type_map = {
        'General': 'Transport',
        'School': 'SchoolBus',
        'Delivery': 'DeliveryVan',
        'Moving': 'MovingTruck'
    }
    required_vehicle_type = type_map.get(booking_type, 'Transport')

    # Find an available vehicle of that type
    available_vehicle = Vehicle.query.filter_by(
        type=required_vehicle_type, 
        status='Active'
    ).join(DriverProfile).filter(DriverProfile.status == 'Available').first()

    if available_vehicle and available_vehicle.driver:
        driver_prof = available_vehicle.driver
        new_booking.driver_id = driver_prof.user_id
        new_booking.vehicle_id = available_vehicle.id
        new_booking.status = 'Assigned'
        driver_prof.status = 'Active' # driver is now busy

        # Log notification
        notif = Notification(
            user_id=user_id,
            message=f"Booking #{new_booking.id} has been accepted. Driver {driver_prof.user.name} is assigned with vehicle {available_vehicle.make} ({available_vehicle.plate_number}).",
            type="Push"
        )
        db.session.add(notif)
        
        # Notify driver too
        driver_notif = Notification(
            user_id=driver_prof.user_id,
            message=f"New trip assigned: #{new_booking.id} from {pickup_address} to {dropoff_address}.",
            type="Push"
        )
        db.session.add(driver_notif)

    db.session.commit()

    return jsonify({
        'message': 'Booking created successfully',
        'booking': new_booking.to_dict()
    }), 201

@bookings_bp.route('', methods=['GET'])
@jwt_required()
def get_bookings():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404

    if user.role == 'passenger':
        bookings = Booking.query.filter_by(customer_id=user_id).order_by(Booking.created_at.desc()).all()
    elif user.role == 'driver':
        bookings = Booking.query.filter_by(driver_id=user_id).order_by(Booking.created_at.desc()).all()
    else: # Admin, Dispatcher
        bookings = Booking.query.order_by(Booking.created_at.desc()).all()

    return jsonify([b.to_dict() for b in bookings]), 200

@bookings_bp.route('/<int:booking_id>', methods=['GET'])
@jwt_required()
def get_booking(booking_id):
    user_id = int(get_jwt_identity())
    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({'message': 'Booking not found'}), 404

    # Authorization check
    user = User.query.get(user_id)
    if user.role == 'passenger' and booking.customer_id != user_id:
        return jsonify({'message': 'Unauthorized'}), 403
    if user.role == 'driver' and booking.driver_id != user_id:
        return jsonify({'message': 'Unauthorized'}), 403

    return jsonify(booking.to_dict()), 200

@bookings_bp.route('/<int:booking_id>/assign', methods=['POST'])
@jwt_required()
def assign_booking(booking_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if user.role not in ['admin', 'dispatcher']:
        return jsonify({'message': 'Unauthorized'}), 403

    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({'message': 'Booking not found'}), 404

    data = request.get_json() or {}
    driver_user_id = data.get('driver_id')
    vehicle_id = data.get('vehicle_id')

    if not driver_user_id or not vehicle_id:
        return jsonify({'message': 'Driver ID and Vehicle ID are required'}), 400

    driver_profile = DriverProfile.query.filter_by(user_id=driver_user_id).first()
    vehicle = Vehicle.query.get(vehicle_id)

    if not driver_profile or not vehicle:
        return jsonify({'message': 'Driver or Vehicle not found'}), 404

    # Update driver status
    driver_profile.status = 'Active'
    driver_profile.vehicle_id = vehicle_id

    booking.driver_id = driver_user_id
    booking.vehicle_id = vehicle_id
    booking.status = 'Assigned'

    # Notify passenger
    notif = Notification(
        user_id=booking.customer_id,
        message=f"Booking #{booking.id} has been assigned to driver {driver_profile.user.name} with vehicle {vehicle.make} ({vehicle.plate_number}).",
        type="Push"
    )
    db.session.add(notif)
    
    # Notify driver
    d_notif = Notification(
        user_id=driver_user_id,
        message=f"New trip assigned: #{booking.id} from {booking.pickup_address} to {booking.dropoff_address}.",
        type="Push"
    )
    db.session.add(d_notif)

    db.session.commit()
    return jsonify({'message': 'Booking assigned successfully', 'booking': booking.to_dict()}), 200

@bookings_bp.route('/<int:booking_id>/status', methods=['PUT'])
@jwt_required()
def update_booking_status(booking_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    booking = Booking.query.get(booking_id)

    if not booking:
        return jsonify({'message': 'Booking not found'}), 404

    # Security check: passenger can cancel pending, driver can change progress, admin/dispatcher can do anything
    data = request.get_json() or {}
    new_status = data.get('status') # Assigned, Active, Completed, Cancelled

    if not new_status:
        return jsonify({'message': 'Status is required'}), 400

    # Authorization logic
    if user.role == 'passenger':
        if booking.customer_id != user_id:
            return jsonify({'message': 'Unauthorized'}), 403
        if new_status != 'Cancelled' or booking.status not in ['Pending', 'Assigned']:
            return jsonify({'message': 'Passengers can only cancel pending or assigned trips'}), 400
    elif user.role == 'driver':
        if booking.driver_id != user_id:
            return jsonify({'message': 'Unauthorized'}), 403
        if new_status not in ['Active', 'Completed']:
            return jsonify({'message': 'Drivers can only set trip to Active or Completed'}), 400
    # Admins/dispatchers can do anything

    # Apply state changes
    old_status = booking.status
    booking.status = new_status

    if new_status == 'Active':
        from backend.routes.tracking import seed_trip_progress
        seed_trip_progress(booking)

    elif new_status == 'Completed':
        # Release driver status
        if booking.driver_id:
            d_prof = DriverProfile.query.filter_by(user_id=booking.driver_id).first()
            if d_prof:
                d_prof.status = 'Available'
        # Add mock mileage to vehicle
        if booking.vehicle_id:
            veh = Vehicle.query.get(booking.vehicle_id)
            if veh:
                # Add distance to vehicle mileage
                dist = calculate_distance(booking.pickup_lat, booking.pickup_lng, booking.dropoff_lat, booking.dropoff_lng)
                veh.mileage += round(dist, 1)
                # Lower fuel level based on consumption
                fuel_used = (dist / 100.0) * veh.avg_fuel_consumption
                veh.fuel_level = max(0.0, round(veh.fuel_level - (fuel_used / 60.0 * 100), 1)) # Assuming 60L tank

    elif new_status == 'Cancelled':
        if booking.driver_id:
            d_prof = DriverProfile.query.filter_by(user_id=booking.driver_id).first()
            if d_prof:
                d_prof.status = 'Available'

    # Notify passenger
    notif = Notification(
        user_id=booking.customer_id,
        message=f"Your booking #{booking.id} status updated to: {new_status}.",
        type="Push"
    )
    db.session.add(notif)

    db.session.commit()
    return jsonify({'message': 'Status updated successfully', 'booking': booking.to_dict()}), 200
