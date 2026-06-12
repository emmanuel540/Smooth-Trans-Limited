from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
import random
from backend.models import db, TripProgress, Booking
from flask_jwt_extended import jwt_required

tracking_bp = Blueprint('tracking', __name__)

def seed_trip_progress(booking):
    # Clear existing progress logs if any
    TripProgress.query.filter_by(booking_id=booking.id).delete()

    steps = 20
    pickup_lat, pickup_lng = booking.pickup_lat, booking.pickup_lng
    dropoff_lat, dropoff_lng = booking.dropoff_lat, booking.dropoff_lng

    lat_step = (dropoff_lat - pickup_lat) / (steps - 1)
    lng_step = (dropoff_lng - pickup_lng) / (steps - 1)

    now = datetime.utcnow()
    for i in range(steps):
        # Coordinates change every 5 seconds for simulation speed
        step_time = now + timedelta(seconds=i * 6)
        
        # Add slight random deviation to make route look realistic
        dev_lat = random.uniform(-0.0001, 0.0001) if 0 < i < steps - 1 else 0
        dev_lng = random.uniform(-0.0001, 0.0001) if 0 < i < steps - 1 else 0

        progress = TripProgress(
            booking_id=booking.id,
            latitude=pickup_lat + (lat_step * i) + dev_lat,
            longitude=pickup_lng + (lng_step * i) + dev_lng,
            speed=random.uniform(35.0, 55.0) if i < steps - 1 else 0.0,
            timestamp=step_time
        )
        db.session.add(progress)
    
    db.session.commit()

@tracking_bp.route('/<int:booking_id>/progress', methods=['GET'])
@jwt_required()
def get_trip_progress(booking_id):
    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({'message': 'Booking not found'}), 404

    # If the booking is not assigned or is pending, return empty
    if booking.status not in ['Active', 'Completed']:
        return jsonify({
            'status': booking.status,
            'current_location': {'lat': booking.pickup_lat, 'lng': booking.pickup_lng},
            'speed': 0.0,
            'progress': 0.0
        }), 200

    # Query all progress steps
    logs = TripProgress.query.filter_by(booking_id=booking_id).order_by(TripProgress.timestamp.asc()).all()

    if not logs:
        # If no logs exist, seed them (failsafe)
        seed_trip_progress(booking)
        logs = TripProgress.query.filter_by(booking_id=booking_id).order_by(TripProgress.timestamp.asc()).all()

    now = datetime.utcnow()
    
    # Find the current step based on time
    current_log = logs[0]
    completed_steps = 0
    
    for i, log in enumerate(logs):
        if log.timestamp <= now:
            current_log = log
            completed_steps = i + 1
        else:
            break

    progress_pct = (completed_steps / len(logs)) * 100.0

    # If progress reaches 100%, and the trip is still "Active", we could auto-complete it or let driver complete it.
    # We will let driver click complete, but default progress to 100.
    return jsonify({
        'status': booking.status,
        'current_location': {
            'lat': current_log.latitude,
            'lng': current_log.longitude
        },
        'speed': round(current_log.speed, 1),
        'progress': round(progress_pct, 1),
        'eta_seconds': max(0, int((logs[-1].timestamp - now).total_seconds())) if progress_pct < 100 else 0
    }), 200
