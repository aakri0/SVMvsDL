from flask import Blueprint, request, jsonify
from model.model import ActivityModel
from datetime import datetime

predict_route = Blueprint('predict_route', __name__)

# Load the LSTM model
model = ActivityModel("model/LSTM_model_50.h5")

@predict_route.route('/predict', methods=['POST'])
def predict():
    # Import Firestore client here to avoid circular import
    from app import db

    data = request.get_json()

    if 'window' not in data:
        return jsonify({'error': 'Missing "window" in request'}), 400

    try:
        result = model.predict(data['window'])
        user_id = data.get('user_id', 'user_1')

        if data['window']:
            last_sample = data['window'][-1]
            x, y, z = last_sample
        else:
            x = y = z = 0.0

        try:
            doc_ref = db.collection('predictions').document()
            doc_ref.set({
                'user_id': user_id,
                'activity': result,
                'timestamp': datetime.utcnow().isoformat(),
                'sensor_data': {'x': float(x), 'y': float(y), 'z': float(z)}
            })
        except Exception as e:
            print(f"[ERROR] Firestore write failed: {e}")

        return jsonify({'activity': result})

    except Exception as e:
        return jsonify({'error': str(e)}), 500
