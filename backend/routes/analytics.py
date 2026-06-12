from flask import Blueprint, jsonify, Response, request
from backend.models import db, Booking, Payment, DriverProfile, Vehicle, User
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
import csv
import io

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/dashboard-stats', methods=['GET'])
@jwt_required()
def get_dashboard_stats():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if user.role not in ['admin', 'dispatcher']:
        return jsonify({'message': 'Unauthorized'}), 403

    # Total Bookings
    total_bookings = Booking.query.count()
    completed_bookings = Booking.query.filter_by(status='Completed').count()
    active_bookings = Booking.query.filter_by(status='Active').count()
    pending_bookings = Booking.query.filter_by(status='Pending').count()

    # Total Revenue (sum of completed payments)
    completed_payments = Payment.query.filter_by(status='Completed').all()
    total_revenue = sum([p.amount for p in completed_payments])

    # Revenue by payment method
    mpesa_revenue = sum([p.amount for p in completed_payments if p.payment_method == 'MPesa'])
    card_revenue = sum([p.amount for p in completed_payments if p.payment_method == 'Card'])

    # Booking types distribution
    types = ['General', 'School', 'Delivery', 'Moving']
    type_distribution = []
    for t in types:
        count = Booking.query.filter_by(booking_type=t).count()
        type_distribution.append({'name': t, 'value': count})

    # Revenue over time (last 7 days)
    revenue_chart = []
    now = datetime.utcnow()
    for i in range(6, -1, -1):
        day = now - timedelta(days=i)
        day_str = day.strftime('%a') # Mon, Tue...
        # Query completed payments on this day
        start_date = datetime(day.year, day.month, day.day, 0, 0, 0)
        end_date = datetime(day.year, day.month, day.day, 23, 59, 59)
        day_payments = Payment.query.filter(
            Payment.status == 'Completed',
            Payment.created_at >= start_date,
            Payment.created_at <= end_date
        ).all()
        day_rev = sum([p.amount for p in day_payments])
        
        # Also count bookings made on this day
        day_bookings_count = Booking.query.filter(
            Booking.created_at >= start_date,
            Booking.created_at <= end_date
        ).count()

        revenue_chart.append({
            'day': day_str,
            'revenue': day_rev,
            'bookings': day_bookings_count
        })

    # Driver leaderboard
    drivers = DriverProfile.query.order_by(DriverProfile.rating.desc()).limit(5).all()
    driver_leaderboard = [{
        'name': d.user.name,
        'rating': d.rating,
        'status': d.status,
        'trips_completed': Booking.query.filter_by(driver_id=d.user_id, status='Completed').count()
    } for d in drivers]

    # Fleet status summary
    active_vehicles = Vehicle.query.filter_by(status='Active').count()
    service_vehicles = Vehicle.query.filter_by(status='InService').count()
    maintenance_vehicles = Vehicle.query.filter_by(status='Maintenance').count()

    return jsonify({
        'summary': {
            'total_bookings': total_bookings,
            'completed_bookings': completed_bookings,
            'active_bookings': active_bookings,
            'pending_bookings': pending_bookings,
            'total_revenue': total_revenue,
            'mpesa_revenue': mpesa_revenue,
            'card_revenue': card_revenue,
            'fleet_active': active_vehicles,
            'fleet_in_service': service_vehicles,
            'fleet_maintenance': maintenance_vehicles
        },
        'type_distribution': type_distribution,
        'revenue_chart': revenue_chart,
        'driver_leaderboard': driver_leaderboard
    }), 200

@analytics_bp.route('/export/csv', methods=['GET'])
@jwt_required()
def export_csv():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if user.role not in ['admin', 'dispatcher']:
        return jsonify({'message': 'Unauthorized'}), 403

    report_type = request.args.get('type', 'bookings') # bookings, fleet, revenue

    output = io.StringIO()
    writer = csv.writer(output)

    if report_type == 'bookings':
        writer.writerow(['Booking ID', 'Customer Name', 'Driver Name', 'Type', 'Pickup Address', 'Dropoff Address', 'Fare (KES)', 'Status', 'Date'])
        bookings = Booking.query.all()
        for b in bookings:
            writer.writerow([
                b.id,
                b.customer.name if b.customer else 'N/A',
                b.driver.name if b.driver else 'Unassigned',
                b.booking_type,
                b.pickup_address,
                b.dropoff_address,
                b.fare,
                b.status,
                b.created_at.strftime('%Y-%m-%d %H:%M:%S') if b.created_at else 'N/A'
            ])
        filename = "bookings_report.csv"

    elif report_type == 'fleet':
        writer.writerow(['Vehicle ID', 'Plate Number', 'Make', 'Model', 'Year', 'Type', 'Status', 'Mileage (km)', 'Fuel Level (%)'])
        vehicles = Vehicle.query.all()
        for v in vehicles:
            writer.writerow([
                v.id,
                v.plate_number,
                v.make,
                v.model,
                v.year,
                v.type,
                v.status,
                v.mileage,
                v.fuel_level
            ])
        filename = "fleet_report.csv"

    elif report_type == 'revenue':
        writer.writerow(['Payment ID', 'Booking ID', 'Invoice No', 'Amount (KES)', 'Payment Method', 'Status', 'Transaction ID', 'Date'])
        payments = Payment.query.all()
        for p in payments:
            writer.writerow([
                p.id,
                p.booking_id,
                p.invoice_no,
                p.amount,
                p.payment_method,
                p.status,
                p.transaction_id or 'Pending',
                p.created_at.strftime('%Y-%m-%d %H:%M:%S') if p.created_at else 'N/A'
            ])
        filename = "revenue_report.csv"
    
    else:
        return jsonify({'message': 'Invalid report type'}), 400

    output.seek(0)
    return Response(
        output.getvalue(),
        mimetype="text/csv",
        headers={"Content-disposition": f"attachment; filename={filename}"}
    )
