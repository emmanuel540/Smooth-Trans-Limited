from datetime import datetime, timedelta
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt

db = SQLAlchemy()
bcrypt = Bcrypt()

class BaseModel(db.Model):
    __abstract__ = True
    def __init__(self, **kwargs):
        super().__init__(**kwargs)

class User(BaseModel):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='passenger') # passenger, driver, dispatcher, admin
    phone = db.Column(db.String(20), nullable=True)
    is_verified = db.Column(db.Boolean, default=False)
    reset_token = db.Column(db.String(100), nullable=True)
    reset_token_expiry = db.Column(db.DateTime, nullable=True)
    verification_code = db.Column(db.String(10), nullable=True)
    verification_code_expiry = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    driver_profile = db.relationship('DriverProfile', back_populates='user', uselist=False)
    bookings = db.relationship('Booking', back_populates='customer', foreign_keys='Booking.customer_id', lazy=True)
    notifications = db.relationship('Notification', backref='user', lazy=True)

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'phone': self.phone,
            'is_verified': self.is_verified,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class DriverProfile(BaseModel):
    __tablename__ = 'driver_profiles'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    license_number = db.Column(db.String(50), nullable=False)
    license_expiry = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(20), default='Available') # Available, Active, Offline
    rating = db.Column(db.Float, default=5.0)
    vehicle_id = db.Column(db.Integer, db.ForeignKey('vehicles.id'), nullable=True)

    user = db.relationship('User', back_populates='driver_profile')
    vehicle = db.relationship('Vehicle', back_populates='driver')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.user.name if self.user else None,
            'email': self.user.email if self.user else None,
            'phone': self.user.phone if self.user else None,
            'license_number': self.license_number,
            'license_expiry': self.license_expiry.isoformat() if self.license_expiry else None,
            'status': self.status,
            'rating': self.rating,
            'vehicle_id': self.vehicle_id,
            'vehicle': self.vehicle.to_dict() if self.vehicle else None
        }

class Vehicle(BaseModel):
    __tablename__ = 'vehicles'
    id = db.Column(db.Integer, primary_key=True)
    plate_number = db.Column(db.String(20), unique=True, nullable=False)
    make = db.Column(db.String(50), nullable=False)
    model = db.Column(db.String(50), nullable=False)
    year = db.Column(db.Integer, nullable=False)
    type = db.Column(db.String(20), nullable=False) # Transport, SchoolBus, DeliveryVan, MovingTruck
    status = db.Column(db.String(20), default='Active') # Active, InService, Maintenance
    mileage = db.Column(db.Float, default=0.0)
    fuel_level = db.Column(db.Float, default=100.0) # percentage 0 to 100
    avg_fuel_consumption = db.Column(db.Float, default=10.0) # liters per 100km
    last_service_mileage = db.Column(db.Float, default=0.0)

    driver = db.relationship('DriverProfile', back_populates='vehicle', uselist=False)
    maintenance_logs = db.relationship('MaintenanceLog', backref='vehicle', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'plate_number': self.plate_number,
            'make': self.make,
            'model': self.model,
            'year': self.year,
            'type': self.type,
            'status': self.status,
            'mileage': self.mileage,
            'fuel_level': self.fuel_level,
            'avg_fuel_consumption': self.avg_fuel_consumption,
            'last_service_mileage': self.last_service_mileage,
            'assigned_driver': self.driver.user.name if (self.driver and self.driver.user) else None
        }

class Booking(BaseModel):
    __tablename__ = 'bookings'
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    driver_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True) # refers to user ID of the driver
    vehicle_id = db.Column(db.Integer, db.ForeignKey('vehicles.id'), nullable=True)
    booking_type = db.Column(db.String(20), nullable=False) # General, School, Delivery, Moving
    pickup_address = db.Column(db.String(200), nullable=False)
    dropoff_address = db.Column(db.String(200), nullable=False)
    pickup_lat = db.Column(db.Float, nullable=False)
    pickup_lng = db.Column(db.Float, nullable=False)
    dropoff_lat = db.Column(db.Float, nullable=False)
    dropoff_lng = db.Column(db.Float, nullable=False)
    pickup_time = db.Column(db.DateTime, default=datetime.utcnow)
    fare = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default='Pending') # Pending, Assigned, Active, Completed, Cancelled
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    customer = db.relationship('User', back_populates='bookings', foreign_keys=[customer_id])
    driver = db.relationship('User', foreign_keys=[driver_id])
    payments = db.relationship('Payment', backref='booking', lazy=True)
    trip_progress = db.relationship('TripProgress', backref='booking', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'customer_id': self.customer_id,
            'customer_name': self.customer.name if self.customer else None,
            'driver_id': self.driver_id,
            'driver_name': self.driver.name if self.driver else None,
            'vehicle_id': self.vehicle_id,
            'booking_type': self.booking_type,
            'pickup_address': self.pickup_address,
            'dropoff_address': self.dropoff_address,
            'pickup_coords': {'lat': self.pickup_lat, 'lng': self.pickup_lng},
            'dropoff_coords': {'lat': self.dropoff_lat, 'lng': self.dropoff_lng},
            'pickup_time': self.pickup_time.isoformat() if self.pickup_time else None,
            'fare': self.fare,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'payment_status': self.payments[0].status if self.payments else 'Unpaid'
        }

class Payment(BaseModel):
    __tablename__ = 'payments'
    id = db.Column(db.Integer, primary_key=True)
    booking_id = db.Column(db.Integer, db.ForeignKey('bookings.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    payment_method = db.Column(db.String(20), nullable=False) # MPesa, Card
    status = db.Column(db.String(20), default='Pending') # Pending, Completed, Failed
    transaction_id = db.Column(db.String(50), unique=True, nullable=True)
    invoice_no = db.Column(db.String(50), unique=True, nullable=False)
    checkout_request_id = db.Column(db.String(100), nullable=True)
    merchant_request_id = db.Column(db.String(100), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'booking_id': self.booking_id,
            'amount': self.amount,
            'payment_method': self.payment_method,
            'status': self.status,
            'transaction_id': self.transaction_id,
            'invoice_no': self.invoice_no,
            'checkout_request_id': self.checkout_request_id,
            'merchant_request_id': self.merchant_request_id,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class MaintenanceLog(BaseModel):
    __tablename__ = 'maintenance_logs'
    id = db.Column(db.Integer, primary_key=True)
    vehicle_id = db.Column(db.Integer, db.ForeignKey('vehicles.id'), nullable=False)
    description = db.Column(db.String(250), nullable=False)
    cost = db.Column(db.Float, nullable=False)
    service_date = db.Column(db.Date, default=lambda: datetime.utcnow().date())
    current_mileage = db.Column(db.Float, default=0.0)

    def to_dict(self):
        return {
            'id': self.id,
            'vehicle_id': self.vehicle_id,
            'description': self.description,
            'cost': self.cost,
            'service_date': self.service_date.isoformat() if self.service_date else None,
            'current_mileage': self.current_mileage
        }

class Notification(BaseModel):
    __tablename__ = 'notifications'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    message = db.Column(db.String(250), nullable=False)
    type = db.Column(db.String(20), nullable=False) # SMS, Email, Push
    status = db.Column(db.String(20), default='Sent') # Sent, Read
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'message': self.message,
            'type': self.type,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class TripProgress(BaseModel):
    __tablename__ = 'trip_progress'
    id = db.Column(db.Integer, primary_key=True)
    booking_id = db.Column(db.Integer, db.ForeignKey('bookings.id'), nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    speed = db.Column(db.Float, default=0.0)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'booking_id': self.booking_id,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'speed': self.speed,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        }
