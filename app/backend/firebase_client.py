# app/backend/firebase_client.py
#
# Lazy Firestore client. The module-level `db` symbol is only initialized on
# first access — this lets tests / CI import the rest of the backend without
# needing a real service-account JSON.

import glob
import os

import firebase_admin
from firebase_admin import credentials, firestore

CREDENTIALS_DIR = os.path.join(os.path.dirname(__file__), "credentials")

_db = None


def _resolve_credentials_path() -> str:
    """Return the path to a Firebase service-account JSON.

    Resolution order:
      1. FIREBASE_CREDENTIALS env var (explicit absolute path).
      2. The first *.json file inside app/backend/credentials/.
    """
    env_path = os.environ.get("FIREBASE_CREDENTIALS")
    if env_path:
        if not os.path.exists(env_path):
            raise FileNotFoundError(
                f"FIREBASE_CREDENTIALS points to a missing file: {env_path}"
            )
        return env_path

    matches = sorted(glob.glob(os.path.join(CREDENTIALS_DIR, "*.json")))
    if not matches:
        raise FileNotFoundError(
            "No Firebase service-account JSON found. "
            f"Place one in {CREDENTIALS_DIR} or set the FIREBASE_CREDENTIALS env var."
        )
    return matches[0]


def get_db():
    """Initialize Firebase on first call and return the Firestore client."""
    global _db
    if _db is None:
        if not firebase_admin._apps:
            cred = credentials.Certificate(_resolve_credentials_path())
            firebase_admin.initialize_app(cred)
        _db = firestore.client()
    return _db


def __getattr__(name):
    # Preserves the legacy `from app.backend.firebase_client import db` API
    # while keeping initialization lazy.
    if name == "db":
        return get_db()
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")
