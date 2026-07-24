from flask import Blueprint, request, jsonify
from datetime import datetime, timezone
from backend.models import db, Vehicle, MaintenanceLog, DriverProfile
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.models import User

fleet_bp = Blueprint('fleet', __name__)

@fleet_bp.route('', methods=['GET'])
@jwt_required()
def get_fleet():
    # Only Admin, Dispatcher, and Driver can access fleet lists (Drivers can query to check their vehicle status)
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404

    vehicles = Vehicle.query.all()
    return jsonify([v.to_dict() for v in vehicles]), 200

@fleet_bp.route('', methods=['POST'])
@jwt_required()
def add_vehicle():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user or user.role not in ['admin', 'dispatcher']:
        return jsonify({'message': 'Unauthorized'}), 403

    data = request.get_json() or {}
    plate_number = data.get('plate_number')
    make = data.get('make')
    model = data.get('model')
    year = data.get('year')
    v_type = data.get('type') # Transport, SchoolBus, DeliveryVan, MovingTruck
    
    if year is None or not all([plate_number, make, model, v_type]):
        return jsonify({'message': 'Missing vehicle details'}), 400

    if Vehicle.query.filter_by(plate_number=plate_number).first():
        return jsonify({'message': 'Plate number already registered'}), 400

    new_vehicle = Vehicle(
        plate_number=str(plate_number),
        make=str(make),
        model=str(model),
        year=int(year),
        type=str(v_type),
        status='Active',
        mileage=float(data.get('mileage', 0.0) or 0.0),
        fuel_level=float(data.get('fuel_level', 100.0) or 100.0),
        avg_fuel_consumption=float(data.get('avg_fuel_consumption', 10.0) or 10.0),
        last_service_mileage=float(data.get('last_service_mileage', 0.0) or 0.0)
    )

    db.session.add(new_vehicle)
    db.session.commit()

    return jsonify({'message': 'Vehicle added successfully', 'vehicle': new_vehicle.to_dict()}), 201

@fleet_bp.route('/import', methods=['POST'])
@jwt_required()
def import_fleet():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user or user.role not in ['admin', 'dispatcher']:
        return jsonify({'message': 'Unauthorized'}), 403

    import csv
    import io

    vehicles_data = []

    # Handle file upload (CSV) or JSON array
    if 'file' in request.files:
        file = request.files['file']
        stream = io.StringIO(file.stream.read().decode("UTF-8"), newline=None)
        reader = csv.DictReader(stream)
        for row in reader:
            clean_row = {k.strip(): v.strip() for k, v in row.items() if k}
            vehicles_data.append({
                'plate_number': clean_row.get('Plate Number'),
                'make': clean_row.get('Make'),
                'model': clean_row.get('Model'),
                'year': clean_row.get('Year'),
                'type': clean_row.get('Type'),
                'status': clean_row.get('Status', 'Active'),
                'mileage': clean_row.get('Mileage (km)', 0),
                'fuel_level': clean_row.get('Fuel Level (%)', 100)
            })
    elif request.is_json:
        payload = request.get_json()
        vehicles_data = payload.get('vehicles', []) if isinstance(payload, dict) else payload

    if not vehicles_data:
        return jsonify({'message': 'No vehicle data provided'}), 400

    imported_count = 0
    updated_count = 0

    for item in vehicles_data:
        plate_number = item.get('plate_number')
        make = item.get('make')
        model = item.get('model')
        year = item.get('year')
        v_type = item.get('type')

        if year is None or not all([plate_number, make, model, v_type]):
            continue

        item_mileage = item.get('mileage')
        item_fuel = item.get('fuel_level')

        existing = Vehicle.query.filter_by(plate_number=str(plate_number)).first()
        if existing:
            existing.make = str(make)
            existing.model = str(model)
            existing.year = int(year)
            existing.type = str(v_type)
            existing.status = str(item.get('status', existing.status))
            if item_mileage is not None:
                existing.mileage = float(item_mileage)
            if item_fuel is not None:
                existing.fuel_level = float(item_fuel)
            updated_count += 1
        else:
            v = Vehicle(
                plate_number=str(plate_number),
                make=str(make),
                model=str(model),
                year=int(year),
                type=str(v_type),
                status=str(item.get('status', 'Active')),
                mileage=float(item_mileage) if item_mileage is not None else 0.0,
                fuel_level=float(item_fuel) if item_fuel is not None else 100.0
            )
            db.session.add(v)
            imported_count += 1

    db.session.commit()
    return jsonify({
        'message': f'Import successful: {imported_count} created, {updated_count} updated.',
        'imported_count': imported_count,
        'updated_count': updated_count
    }), 200

@fleet_bp.route('/<int:vehicle_id>', methods=['GET', 'PUT', 'DELETE'])
@jwt_required()
def handle_vehicle(vehicle_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404

    vehicle = Vehicle.query.get(vehicle_id)
    if not vehicle:
        return jsonify({'message': 'Vehicle not found'}), 404

    if request.method == 'GET':
        return jsonify(vehicle.to_dict()), 200

    if user.role not in ['admin', 'dispatcher']:
        return jsonify({'message': 'Unauthorized'}), 403

    if request.method == 'PUT':
        data = request.get_json() or {}
        vehicle.plate_number = data.get('plate_number', vehicle.plate_number)
        vehicle.make = data.get('make', vehicle.make)
        vehicle.model = data.get('model', vehicle.model)
        vehicle.year = data.get('year', vehicle.year)
        vehicle.type = data.get('type', vehicle.type)
        vehicle.status = data.get('status', vehicle.status)
        vehicle.mileage = data.get('mileage', vehicle.mileage)
        vehicle.fuel_level = data.get('fuel_level', vehicle.fuel_level)
        vehicle.avg_fuel_consumption = data.get('avg_fuel_consumption', vehicle.avg_fuel_consumption)
        vehicle.last_service_mileage = data.get('last_service_mileage', vehicle.last_service_mileage)

        db.session.commit()
        return jsonify({'message': 'Vehicle updated successfully', 'vehicle': vehicle.to_dict()}), 200

    if request.method == 'DELETE':
        db.session.delete(vehicle)
        db.session.commit()
        return jsonify({'message': 'Vehicle deleted successfully'}), 200

@fleet_bp.route('/<int:vehicle_id>/maintenance', methods=['GET', 'POST'])
@jwt_required()
def vehicle_maintenance(vehicle_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404

    vehicle = Vehicle.query.get(vehicle_id)
    if not vehicle:
        return jsonify({'message': 'Vehicle not found'}), 404

    if request.method == 'GET':
        logs = MaintenanceLog.query.filter_by(vehicle_id=vehicle_id).order_by(MaintenanceLog.service_date.desc()).all()
        return jsonify([log.to_dict() for log in logs]), 200

    if user.role not in ['admin', 'dispatcher']:
        return jsonify({'message': 'Unauthorized'}), 403

    # Add Maintenance Log
    data = request.get_json() or {}
    description = data.get('description')
    cost = data.get('cost')
    
    if not description or cost is None:
        return jsonify({'message': 'Description and Cost are required'}), 400

    # Put vehicle in maintenance status
    vehicle.status = 'Maintenance'
    vehicle.last_service_mileage = vehicle.mileage # Update service mileage

    log = MaintenanceLog(
        vehicle_id=vehicle_id,
        description=description,
        cost=float(cost),
        service_date=datetime.now(timezone.utc).date(),
        current_mileage=vehicle.mileage
    )
    db.session.add(log)
    db.session.commit()

    return jsonify({'message': 'Maintenance logged. Vehicle is now in maintenance.', 'log': log.to_dict()}), 201
