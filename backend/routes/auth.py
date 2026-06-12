from flask import Blueprint, request, jsonify
from datetime import datetime, date
from backend.models import db, User, DriverProfile, Vehicle
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'passenger') # passenger, driver, dispatcher, admin
    phone = data.get('phone')

    if not name or not email or not password:
        return jsonify({'message': 'Name, email, and password are required'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'message': 'Email already exists'}), 400

    new_user = User(
        name=name,
        email=email,
        role=role,
        phone=phone,
        is_verified=False
    )
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.flush() # Get user ID

    # If user is a driver, create driver profile
    if role == 'driver':
        license_num = data.get('license_number', 'DL-MOCK123')
        expiry_str = data.get('license_expiry', '2030-01-01')
        try:
            expiry_date = datetime.strptime(expiry_str, '%Y-%m-%d').date()
        except ValueError:
            expiry_date = date(2030, 1, 1)

        new_driver = DriverProfile(
            user_id=new_user.id,
            license_number=license_num,
            license_expiry=expiry_date,
            status='Available'
        )
        db.session.add(new_driver)

    db.session.commit()

    # Generate token
    token = create_access_token(identity=str(new_user.id))
    return jsonify({
        'message': 'Registration successful',
        'token': token,
        'user': new_user.to_dict()
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'message': 'Email and password are required'}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({'message': 'Invalid email or password'}), 401

    token = create_access_token(identity=str(user.id))
    
    response_data = {
        'token': token,
        'user': user.to_dict()
    }
    
    if user.role == 'driver' and user.driver_profile:
        response_data['driver_profile'] = user.driver_profile.to_dict()

    return jsonify(response_data), 200

@auth_bp.route('/profile', methods=['GET', 'PUT'])
@jwt_required()
def profile():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404

    if request.method == 'GET':
        resp = {'user': user.to_dict()}
        if user.role == 'driver' and user.driver_profile:
            resp['driver_profile'] = user.driver_profile.to_dict()
        return jsonify(resp), 200

    elif request.method == 'PUT':
        data = request.get_json() or {}
        user.name = data.get('name', user.name)
        user.phone = data.get('phone', user.phone)
        
        if user.role == 'driver' and user.driver_profile:
            profile = user.driver_profile
            profile.license_number = data.get('license_number', profile.license_number)
            expiry_str = data.get('license_expiry')
            if expiry_str:
                try:
                    profile.license_expiry = datetime.strptime(expiry_str, '%Y-%m-%d').date()
                except ValueError:
                    pass
        
        db.session.commit()
        return jsonify({'message': 'Profile updated successfully', 'user': user.to_dict()}), 200

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json() or {}
    email = data.get('email')
    if not email:
        return jsonify({'message': 'Email is required'}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        # Avoid user enumeration by returning 200 anyway
        return jsonify({'message': 'If the email exists, a reset code was sent'}), 200

    # Simulate email dispatch
    # Create notification entry
    notif = User.query.filter_by(role='admin').first()
    admin_id = notif.id if notif else user.id
    
    reset_notif = User.query.get(user.id)
    if reset_notif:
        mock_notif = db.session.execute(
            db.select(User).filter_by(id=user.id)
        ).scalar()
        # Create a notification in database
        from backend.models import Notification
        db_notif = Notification(
            user_id=user.id,
            message="Your password reset token is ST-84931. Use it to update your password.",
            type="Email"
        )
        db.session.add(db_notif)
        db.session.commit()

    return jsonify({
        'message': 'Password reset instructions sent to email',
        'reset_token': 'ST-84931' # For frontend demonstration
    }), 200

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json() or {}
    email = data.get('email')
    token = data.get('token')
    new_password = data.get('password')

    if not email or not token or not new_password:
        return jsonify({'message': 'Email, token, and new password are required'}), 400

    if token != 'ST-84931':
        return jsonify({'message': 'Invalid token'}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'message': 'User not found'}), 404

    user.set_password(new_password)
    db.session.commit()
    return jsonify({'message': 'Password reset successfully'}), 200

@auth_bp.route('/verify-email', methods=['POST'])
def verify_email():
    data = request.get_json() or {}
    email = data.get('email')
    code = data.get('code')

    if not email or not code:
        return jsonify({'message': 'Email and verification code are required'}), 400

    if code != '123456': # Standard mock code
        return jsonify({'message': 'Invalid verification code'}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'message': 'User not found'}), 404

    user.is_verified = True
    db.session.commit()
    return jsonify({'message': 'Email verified successfully'}), 200
