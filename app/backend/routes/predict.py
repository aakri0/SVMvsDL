from flask import Blueprint, request, jsonify
from model.model import ActivityModel
from google.cloud import firestore_v1 as firestore  # Firestore client with SERVER_TIMESTAMP
from datetime import datetime  # For optional client-side timestamp

predict_route = Blueprint('predict_route', __name__)
model = ActivityModel("model/LSTM_model_50.h5")  # Load model once at module level

@predict_route.route('/predict', methods=['POST'])
def predict():
    try:
        from app import db  # Avoid circular import
        data = request.get_json()

        if not data or 'window' not in data:
            return jsonify({'error': 'Missing "window" in request'}), 400

        # Run inference
        result = model.predict(data['window'])

        user_id = data.get('user_id', 'user_1')
        last_sample = data['window'][-1] if data['window'] else [0.0, 0.0, 0.0]
        x, y, z = last_sample

        # Create document
        prediction_doc = {
            'user_id': user_id,
            'activity': result,
            'timestamp': firestore.SERVER_TIMESTAMP,  # ✅ Always use server timestamp
            'client_time': datetime.utcnow().isoformat(),  # ⏱ Optional: debug-only fallback
            'sensor_data': {
                'x': float(x),
                'y': float(y),
                'z': float(z)
            }
        }

        try:
            db.collection('predictions').add(prediction_doc)
        except Exception as e:
            print(f"[ERROR] Firestore write failed: {e}")

        return jsonify({'activity': result})

    except Exception as e:
        print(f"[ERROR] Prediction failed: {e}")
        return jsonify({'error': str(e)}), 500
