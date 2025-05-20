from flask import Blueprint, request, jsonify
from model.model import ActivityModel
from datetime import datetime

predict_route = Blueprint('predict_route', __name__)
model = ActivityModel("model/LSTM_model_50.h5")  # ✅ Load once

@predict_route.route('/predict', methods=['POST'])
def predict():
    try:
        from app import db  # ⛓️ Avoid circular import
        data = request.get_json()

        if not data or 'window' not in data:
            return jsonify({'error': 'Missing "window" in request'}), 400

        result = model.predict(data['window'])  # 🧠 Run inference

        user_id = data.get('user_id', 'user_1')
        last_sample = data['window'][-1] if data['window'] else [0.0, 0.0, 0.0]
        x, y, z = last_sample

        try:
            db.collection('predictions').document().set({
                'user_id': user_id,
                'activity': result,
                'timestamp': datetime.utcnow().isoformat(),
                'sensor_data': {'x': float(x), 'y': float(y), 'z': float(z)}
            })
        except Exception as e:
            print(f"[ERROR] Firestore write failed: {e}")

        return jsonify({'activity': result})

    except Exception as e:
        print(f"[ERROR] Prediction failed: {e}")
        return jsonify({'error': str(e)}), 500
