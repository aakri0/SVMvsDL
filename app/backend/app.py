from flask import Flask
from flask_cors import CORS
from routes.predict import predict_route
# from simulator.simulator import get_prediction_route

app = Flask(__name__)
CORS(app)

# Register routes
app.register_blueprint(predict_route, url_prefix='/api')
# app.register_blueprint(get_prediction_route, url_prefix='/api')

@app.route('/')
def home():
    return "LSTM Streaming Prediction Server is running. Check /api/latest_predictions."

if __name__ == "__main__":
    app.run(debug=True, port=5001)
