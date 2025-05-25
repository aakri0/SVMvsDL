# app/backend/firebase_client.py

import firebase_admin
from firebase_admin import credentials, firestore
import os

if not firebase_admin._apps:
    firebase_credentials_path = "/Users/REDACTED/SVMvsDL/app/backend/credentials/*.json"
    if not os.path.exists(firebase_credentials_path):
        raise FileNotFoundError(f"Firebase credentials file not found at {firebase_credentials_path}")

    cred = credentials.Certificate(firebase_credentials_path)
    firebase_admin.initialize_app(cred)
    print("✅ Firebase initialized.")

db = firestore.client()
