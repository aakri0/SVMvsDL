from flask import Blueprint, request, jsonify
from model.model import ActivityModel
from google.cloud import firestore_v1 as firestore  # Firestore client with SERVER_TIMESTAMP
from datetime import datetime  # For optional logging/debugging

predict_route = Blueprint('predict_route', __name__)
model = ActivityModel("model/LSTM_model_50.h5")  # Load model once

@predict_route.route('/predict', methods=['POST'])
def predict():
    try:
        from app import db  # Import db here to avoid circular import
        data = request.get_json()

        if not data or 'window' not in data:
            return jsonify({'error': 'Missing "window" in request'}), 400

        # Perform prediction
        activity, confidence = model.predict_with_accuracy(data['window'])

        # Pull relevant metadata
        user_id = data.get('user_id', 'user_1')
        data_source = data.get('source', 'simulator')
        actual_activity = data.get('actual_activity')  # Only included in simulator mode

        # Use last sample for x/y/z display
        last_sample = data['window'][-1] if data['window'] else [0.0, 0.0, 0.0]
        x, y, z = last_sample

        # Build document for Firestore
        prediction_doc = {
            'user_id': user_id,
            'activity': activity,
            'confidence': confidence,
            'source': data_source,
            'timestamp': firestore.SERVER_TIMESTAMP,  # Firestore generates this
            'sensor_data': {
                'x': float(x),
                'y': float(y),
                'z': float(z)
            }
        }

        # Add actual activity if it was sent (simulated mode only)
        if data_source == "simulated" and actual_activity:
            prediction_doc['actual_activity'] = actual_activity

        try:
            db.collection('predictions').add(prediction_doc)
        except Exception as e:
            print(f"[ERROR] Firestore write failed: {e}")

        return jsonify({'activity': activity, 'confidence': confidence})

    except Exception as e:
        print(f"[ERROR] Prediction failed: {e}")
        return jsonify({'error': str(e)}), 500
