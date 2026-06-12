from flask import Blueprint, request, jsonify
from backend.models import db, Vehicle, Booking
from datetime import datetime, timedelta
import random
import math

ai_bp = Blueprint('ai', __name__)

# Helper to generate simulated path between two coordinates for map display
def generate_route_path(start, end, deviation_factor=0.0):
    steps = 15
    lat1, lng1 = start['lat'], start['lng']
    lat2, lng2 = end['lat'], end['lng']
    
    path = []
    for i in range(steps):
        t = i / (steps - 1)
        # linear interpolation
        lat = lat1 + (lat2 - lat1) * t
        lng = lng1 + (lng2 - lng1) * t
        
        # Add arc deviation to make routes look distinct on the map
        if 0 < i < steps - 1:
            # perpendicular vector
            p_lat = -(lng2 - lng1)
            p_lng = (lat2 - lat1)
            
            # scale deviation
            dist = math.sin(t * math.pi)
            lat += p_lat * deviation_factor * dist
            lng += p_lng * deviation_factor * dist

        path.append({'lat': lat, 'lng': lng})
    return path

@ai_bp.route('/optimize-route', methods=['POST'])
def optimize_route():
    data = request.get_json() or {}
    pickup = data.get('pickup_coords')
    dropoff = data.get('dropoff_coords')

    if not pickup or not dropoff:
        return jsonify({'message': 'Pickup and dropoff coordinates are required'}), 400

    lat1, lng1 = pickup.get('lat'), pickup.get('lng')
    lat2, lng2 = dropoff.get('lat'), dropoff.get('lng')

    if None in (lat1, lng1, lat2, lng2):
        return jsonify({'message': 'Invalid coordinates'}), 400

    # Base direct distance
    direct_dist = math.sqrt((lat2 - lat1)**2 + (lng2 - lng1)**2) * 111.0

    # 1. Shortest Route
    shortest_dist = round(direct_dist, 2)
    shortest_time = round((shortest_dist / 40.0) * 60) # mins, @ 40 km/h average city speed
    shortest_fuel = round(shortest_dist * 0.10, 1) # 10L/100km
    shortest_cost = round(150 + (shortest_dist * 50), -1)

    # 2. Cheapest Fuel (slightly longer distance, but bypasses traffic and hills for better mileage)
    cheapest_dist = round(direct_dist * 1.12, 2)
    cheapest_time = round((cheapest_dist / 48.0) * 60) # mins, smoother speed
    cheapest_fuel = round(cheapest_dist * 0.075, 1) # 7.5L/100km eco mode
    cheapest_cost = round(150 + (cheapest_dist * 40), -1) # Lower fuel surcharge

    # 3. Fastest Route (Express highway/bypass - longer, but higher speed limit)
    fastest_dist = round(direct_dist * 1.25, 2)
    fastest_time = round((fastest_dist / 65.0) * 60) # mins, @ 65 km/h highway
    fastest_fuel = round(fastest_dist * 0.12, 1) # 12L/100km high speed
    fastest_cost = round(150 + (fastest_dist * 55) + 100, -1) # Toll fee included

    routes = [
        {
            'id': 'shortest',
            'name': 'Shortest Route',
            'description': 'Direct city routes. Higher risk of traffic stops.',
            'distance_km': shortest_dist,
            'duration_mins': shortest_time,
            'fuel_liters': shortest_fuel,
            'cost_kes': shortest_cost,
            'path': generate_route_path(pickup, dropoff, 0.0)
        },
        {
            'id': 'cheapest',
            'name': 'Fuel-Efficient Route',
            'description': 'Flat bypasses avoiding engine-straining hills and intersections.',
            'distance_km': cheapest_dist,
            'duration_mins': cheapest_time,
            'fuel_liters': cheapest_fuel,
            'cost_kes': cheapest_cost,
            'path': generate_route_path(pickup, dropoff, 0.15)
        },
        {
            'id': 'fastest',
            'name': 'Fastest Bypass Expressway',
            'description': 'Expressway link bypassing congestion center. Includes toll surcharge.',
            'distance_km': fastest_dist,
            'duration_mins': fastest_time,
            'fuel_liters': fastest_fuel,
            'cost_kes': fastest_cost,
            'path': generate_route_path(pickup, dropoff, -0.2)
        }
    ]

    return jsonify({
        'pickup': pickup,
        'dropoff': dropoff,
        'routes': routes
    }), 200

@ai_bp.route('/predictive-maintenance', methods=['GET'])
def get_predictive_maintenance():
    vehicles = Vehicle.query.all()
    predictions = []
    
    current_year = datetime.utcnow().year

    for v in vehicles:
        # Distance driven since last maintenance
        miles_since_service = v.mileage - v.last_service_mileage
        
        # Risk factors calculation
        # Baseline service interval: 5000 km
        mileage_risk = min(50.0, (miles_since_service / 5000.0) * 25.0) if miles_since_service > 0 else 0
        if miles_since_service > 5000:
            mileage_risk += (miles_since_service - 5000) / 100.0 * 2.0 # Spikes risk quickly above threshold

        age = max(1, current_year - v.year)
        age_risk = min(20.0, age * 2.5) # older vehicles have higher base risk
        
        # Fuel consumption indicator (irregular high consumption indicates engine issues)
        fuel_consumption_risk = 0
        if v.avg_fuel_consumption > 12.0:
            fuel_consumption_risk = 15.0

        # Low fuel level increases pump overheating risk (mock weight)
        fuel_level_risk = 10.0 if v.fuel_level < 15.0 else 0.0

        total_risk = round(min(99.0, mileage_risk + age_risk + fuel_consumption_risk + fuel_level_risk), 1)

        # Status and Recommendation
        if total_risk < 25.0:
            status = 'Optimal'
            recommendation = 'Vehicle operating normally. Keep on current schedule.'
        elif total_risk < 55.0:
            status = 'Service Recommended'
            recommendation = f'Schedule standard oil change and filter replacements within next {max(50, int(6000 - miles_since_service))} km.'
        else:
            status = 'Critical'
            recommendation = 'IMMEDIATE ATTENTION. High breakdown probability. Inspect brakes, engine compression, and exhaust sensors.'

        predictions.append({
            'vehicle_id': v.id,
            'plate_number': v.plate_number,
            'make_model': f"{v.make} {v.model}",
            'mileage': v.mileage,
            'miles_since_service': round(miles_since_service, 1),
            'fuel_level': v.fuel_level,
            'risk_percentage': total_risk,
            'status': status,
            'recommendation': recommendation,
            'service_cost_estimate': round(5000 + (total_risk * 150), -2)
        })

    # Sort critical first
    predictions.sort(key=lambda x: x['risk_percentage'], reverse=True)
    return jsonify(predictions), 200

@ai_bp.route('/demand-prediction', methods=['GET'])
def get_demand_prediction():
    # Return predictions for hourly booking demands for a full 24h cycle
    # Peak hours modeled: 7-9 AM, 12-2 PM, 4-6 PM
    
    current_time = datetime.utcnow()
    hourly_predictions = []
    
    # Generate 24 hourly nodes starting from current hour
    for hr in range(24):
        target_time = current_time + timedelta(hours=hr)
        hour = target_time.hour
        
        # Base demand sinusoidal loop
        base = 8 + 6 * math.sin((hour - 4) * math.pi / 12)
        
        # Add peak triggers
        if 7 <= hour <= 9: # Morning rush
            base += 18.0
        elif 12 <= hour <= 14: # Midday delivery rush
            base += 12.0
        elif 16 <= hour <= 18: # Evening school/office commute
            base += 22.0
            
        # Add slight random noise for variation
        demand = round(max(3.0, base + random.uniform(-2, 2)), 1)
        
        # Categorized breakdown
        transport_pct = 0.4 if 7 <= hour <= 9 or 16 <= hour <= 18 else 0.3
        school_pct = 0.3 if 7 <= hour <= 8 or 15 <= hour <= 17 else 0.1
        delivery_pct = 0.4 if 11 <= hour <= 14 else 0.2
        moving_pct = 1.0 - (transport_pct + school_pct + delivery_pct)
        
        hourly_predictions.append({
            'hour': f"{hour:02d}:00",
            'total_bookings': int(demand),
            'by_type': {
                'Transport': int(demand * transport_pct),
                'School': int(demand * school_pct),
                'Delivery': int(demand * delivery_pct),
                'Moving': int(demand * moving_pct)
            }
        })
        
    # Generate weekly predictions (next 7 days)
    days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    # Re-order days starting from tomorrow
    start_day_idx = (current_time.weekday() + 1) % 7
    ordered_days = [days[(start_day_idx + i) % 7] for i in range(7)]
    
    weekly_predictions = []
    for day in ordered_days:
        # Weekdays have higher base transport/school, weekends have higher moving
        if day in ['Saturday', 'Sunday']:
            volume = random.randint(45, 65)
            types = {'Transport': int(volume * 0.25), 'School': 0, 'Delivery': int(volume * 0.25), 'Moving': int(volume * 0.5)}
        else:
            volume = random.randint(80, 110)
            types = {'Transport': int(volume * 0.4), 'School': int(volume * 0.3), 'Delivery': int(volume * 0.2), 'Moving': int(volume * 0.1)}
            
        weekly_predictions.append({
            'day': day,
            'volume': volume,
            'by_type': types
        })
        
    # Dispatch suggestions
    recommendations = [
        "Fleet Alert: School Transport demand peaks between 07:00 AM - 08:30 AM. Ensure all 3 school buses are marked Active and routes pre-loaded.",
        "Resource Optimisation: Delivery volumes are predicted to surge in the CBD between 11:30 AM and 01:30 PM. Relocate 2 delivery vans from Eastlands to CBD parking zones.",
        "Revenue Opportunity: Moving service requests are 40% higher on Saturdays. Remove Moving Trucks from general maintenance schedules for Friday night."
    ]

    return jsonify({
        'hourly': hourly_predictions,
        'weekly': weekly_predictions,
        'recommendations': recommendations
    }), 200
