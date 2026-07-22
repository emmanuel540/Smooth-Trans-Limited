import os
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# Absolute path of the backend directory (used for the SQLite fallback)
backend_dir = os.path.dirname(os.path.abspath(__file__))
_SQLITE_URI = f"sqlite:///{os.path.join(backend_dir, 'instance', 'smooth_trans.db')}"


def _probe_postgres(url: str) -> bool:
    """Return True if we can open a quick connection to the Postgres URL."""
    try:
        import psycopg2
        conn = psycopg2.connect(url, connect_timeout=5)
        conn.close()
        return True
    except Exception:
        return False


def _resolve_db_url() -> str:
    """Return the database URI to use.

    Priority:
    1. DATABASE_URL env var (normalised to postgresql://)
    2. Local SQLite fallback if DATABASE_URL is missing OR unreachable
    """
    url = os.environ.get('DATABASE_URL', '')
    if url.startswith('postgres://'):
        url = url.replace('postgres://', 'postgresql://', 1)

    if url:
        if _probe_postgres(url):
            print(f"[DB] Connected to Supabase: {url.split('@')[-1]}")
            return url
        else:
            print(f"[DB] WARNING: Cannot reach Supabase. Falling back to local SQLite.")

    print(f"[DB] Using local SQLite: {_SQLITE_URI}")
    return _SQLITE_URI


class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'smooth-trans-super-secret-key-12345')
    SQLALCHEMY_DATABASE_URI = _resolve_db_url()
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-token-key-98765')
    JWT_ACCESS_TOKEN_EXPIRES = 86400  # 24 hours in seconds

    # M-Pesa Configuration
    MPESA_ENVIRONMENT = os.environ.get('MPESA_ENVIRONMENT', 'sandbox')
    MPESA_CONSUMER_KEY = os.environ.get('MPESA_CONSUMER_KEY', '')
    MPESA_CONSUMER_SECRET = os.environ.get('MPESA_CONSUMER_SECRET', '')
    MPESA_SHORTCODE = os.environ.get('MPESA_SHORTCODE', '174379')
    MPESA_PASSKEY = os.environ.get('MPESA_PASSKEY', '')
    MPESA_CALLBACK_URL = os.environ.get('MPESA_CALLBACK_URL', '')


