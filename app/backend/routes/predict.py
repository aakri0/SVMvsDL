from flask import Blueprint, request, jsonify
from model.model import ActivityModel
from google.cloud import firestore_v1 as firestore

predict_route = Blueprint('predict_route', __name__)
model = ActivityModel("/Users/aakrisht/Developer/EL/SVMvsDL/app/backend/model/LSTM_model_50.h5")

@predict_route.route('/predict', methods=['POST'])
def predict():
    try:
        from app import db
        data = request.get_json()

        if not data or 'window' not in data:
            return jsonify({'error': 'Missing "window" in request'}), 400

        activity, accuracy = model.predict_with_accuracy(data['window'])

        user_id = data.get('user_id', 'user_1')
        data_source = data.get('source', 'simulated')
        actual_activity = data.get('actual_activity')

        last_sample = data['window'][-1] if data['window'] else [0.0, 0.0, 0.0]
        x, y, z = last_sample

        prediction_doc = {
            'user_id': user_id,
            'activity': activity,
            'accuracy': accuracy,
            'source': data_source,
            'timestamp': firestore.SERVER_TIMESTAMP,
            'sensor_data': {
                'x': float(x),
                'y': float(y),
                'z': float(z)
            }
        }

        if data_source == "simulated" and actual_activity:
            prediction_doc['actual_activity'] = actual_activity

        try:
            db.collection('predictions').add(prediction_doc)
        except Exception as e:
            print(f"[ERROR] Firestore write failed: {e}")

        return jsonify({'activity': activity, 'accuracy': accuracy})

    except Exception as e:
        print(f"[ERROR] Prediction failed: {e}")
        return jsonify({'error': str(e)}), 500