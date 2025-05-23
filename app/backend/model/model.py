from tensorflow.keras.models import load_model
import numpy as np

class ActivityModel:
    def __init__(self, model_path):
        self.model = load_model(model_path)
        self.labels = ['Walking', 'Running', 'Standing', 'Sitting', 'Upstairs', 'Downstairs'] 

    def predict_with_accuracy(self, window):
        # Expecting window to be a list of [x, y, z]
        X = np.array(window).reshape(1, len(window), 3)
        y_prob = self.model.predict(X, verbose=0)[0]
        y_class = np.argmax(y_prob)
        confidence = float(y_prob[y_class])  # Convert numpy float to Python float
        return self.labels[y_class], confidence
