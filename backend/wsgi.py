import sys, os

# When startCommand does 'cd backend && gunicorn wsgi:app',
# CWD is the backend/ folder. Add the project root so 'backend.*' imports resolve.
_backend_dir = os.path.dirname(os.path.abspath(__file__))
_parent_dir = os.path.dirname(_backend_dir)
if _parent_dir not in sys.path:
    sys.path.insert(0, _parent_dir)

from backend.app import create_app

app = create_app()
