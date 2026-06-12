import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'smooth-trans-super-secret-key-12345')
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'sqlite:///smooth_trans.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-token-key-98765')
    JWT_ACCESS_TOKEN_EXPIRES = 86400  # 24 hours in seconds
