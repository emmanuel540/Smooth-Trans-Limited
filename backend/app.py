import os
import sys

# Ensure the parent directory is in sys.path so backend package can be imported reliably
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from backend.models import db, bcrypt
from backend.config import Config

# Import blueprints

from backend.routes.auth import auth_bp
from backend.routes.bookings import bookings_bp
from backend.routes.fleet import fleet_bp
from backend.routes.drivers import drivers_bp
from backend.routes.payments import payments_bp
from backend.routes.tracking import tracking_bp
from backend.routes.ai_features import ai_bp
from backend.routes.analytics import analytics_bp


def init_db(app):
    """Create all tables and seed the default admin user if not present."""
    with app.app_context():
        db.create_all()
        try:
            from backend.models import User
            if not User.query.filter_by(role='admin').first():
                new_admin = User(
                    name="Admin User",
                    email="admin@smooth.co.ke",
                    role="admin",
                    phone="0700000000",
                    is_verified=True
                )
                new_admin.set_password("password123")
                db.session.add(new_admin)
                db.session.commit()
                print("  [OK] Seeded admin user: admin@smooth.co.ke / password123")
        except Exception as e:
            print(f"  [!!] Failed to seed admin user: {e}")





def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions
    db.init_app(app)
    bcrypt.init_app(app)

    # Configure CORS to allow frontend requests
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Initialize JWT Manager and attach standard error handlers
    jwt = JWTManager(app)

    @jwt.unauthorized_loader
    def unauthorized_response(callback):
        return jsonify({"message": "Missing or invalid token"}), 401

    @jwt.expired_token_loader
    def expired_token_response(jwt_header, jwt_payload):
        return jsonify({"message": "Token has expired"}), 401

    # Register Blueprints
    app.register_blueprint(auth_bp,      url_prefix='/api/auth')
    app.register_blueprint(bookings_bp,  url_prefix='/api/bookings')
    app.register_blueprint(fleet_bp,     url_prefix='/api/fleet')
    app.register_blueprint(drivers_bp,   url_prefix='/api/drivers')
    app.register_blueprint(payments_bp,  url_prefix='/api/payments')
    app.register_blueprint(tracking_bp,  url_prefix='/api/tracking')
    app.register_blueprint(ai_bp,        url_prefix='/api/ai')
    app.register_blueprint(analytics_bp, url_prefix='/api/analytics')

    @app.route('/', methods=['GET'])
    def index():
        return jsonify({
            'message': 'Welcome to Smooth Trans Limited API Server',
            'health_check': '/health'
        }), 200

    @app.route('/health', methods=['GET'])
    def health():
        return jsonify({
            'status': 'healthy',
            'name': 'Smooth Trans Limited API Server'
        }), 200

    # Always initialise DB — runs whether started via python app.py or WSGI
    init_db(app)

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)
