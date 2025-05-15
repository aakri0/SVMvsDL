from flask import Blueprint, request, jsonify
from model.model import ActivityModel

predict_route = Blueprint('predict_route', __name__)
model = ActivityModel("model/LSTM_model_50.h5")

@predict_route.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    if 'window' not in data:
        return jsonify({'error': 'Missing "window" in request'}), 400

    try:
        result = model.predict(data['window'])
        return jsonify({'activity': result})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
