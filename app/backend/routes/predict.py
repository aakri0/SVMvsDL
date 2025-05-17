from flask import Blueprint, request, jsonify
from model.model import ActivityModel

# Create a blueprint for prediction routes
predict_route = Blueprint('predict_route', __name__)

# Load the LSTM model
model = ActivityModel("model/LSTM_model_50.h5")

@predict_route.route('/predict', methods=['POST'])
def predict():
    # Parse incoming JSON data
    data = request.get_json()
    
    # Ensure 'window' key is present
    if 'window' not in data:
        return jsonify({'error': 'Missing "window" in request'}), 400

    try:
        # Make prediction and return result
        result = model.predict(data['window'])
        return jsonify({'activity': result})
    except Exception as e:
        # Return error message if something goes wrong
        return jsonify({'error': str(e)}), 500
