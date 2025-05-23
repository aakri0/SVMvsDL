from flask import Flask
from flask_cors import CORS
from routes.predict import predict_route
from datetime import datetime
import firebase_admin
from firebase_admin import credentials, firestore
import os

app = Flask(__name__)
CORS(app)

# 🔐 Initialize Firebase (only once)
if not firebase_admin._apps:
    # Replace wildcard with actual file name or use environment variable
    firebase_credentials_path = "/Users/aakrisht/Developer/EL/SVMvsDL/app/backend/credentials/*.json"  # ✅ Use actual filename
    if not os.path.exists(firebase_credentials_path):
        raise FileNotFoundError(f"Firebase credentials file not found at {firebase_credentials_path}")
    
    cred = credentials.Certificate(firebase_credentials_path)
    firebase_admin.initialize_app(cred)
    print("✅ Firebase initialized.")

db = firestore.client()  # 🌐 Global Firestore client

# 📌 Register routes
app.register_blueprint(predict_route, url_prefix='/api')

@app.route('/test-firestore')
def test_firestore():
    doc_ref = db.collection('predictions').document('connection_test')
    doc_ref.set({
        'user_id': 'test_user',
        'activity': 'Test Activity',
        'timestamp': datetime.utcnow().isoformat(),
        'sensor_data': {'x': 0.0, 'y': 0.0, 'z': 0.0}
    })
    return "✅ Successfully wrote to Firestore!"

if __name__ == "__main__":
    app.run(debug=True, port=5001)  # Ensure this matches the POST target in websocket_server.py
