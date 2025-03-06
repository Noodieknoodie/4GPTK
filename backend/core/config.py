import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = os.environ.get("DB_PATH", f"{BASE_DIR}/data/401k_payments.db")
ORIGINS = [
    "http://localhost:3000",
    "http://localhost:8000",
    "http://localhost:6069",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8000",
    "http://127.0.0.1:6069",
]

APP_NAME = "401(k) Payment Tracking System"
APP_VERSION = "1.0.0"
