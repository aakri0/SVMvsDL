# app/backend/firebase_client.py

import glob
import os

import firebase_admin
from firebase_admin import credentials, firestore

CREDENTIALS_DIR = os.path.join(os.path.dirname(__file__), "credentials")


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


if not firebase_admin._apps:
    cred = credentials.Certificate(_resolve_credentials_path())
    firebase_admin.initialize_app(cred)
    print("✅ Firebase initialized.")

db = firestore.client()
