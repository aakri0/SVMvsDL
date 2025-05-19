import sys
import os
import time

# Fix import path to ensure ActivityModel can be found
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

from model.model import ActivityModel

# Load the trained LSTM model
model = ActivityModel("model/LSTM_model_50.h5")

WINDOW_SIZE = 50
file_path = "simulator/WISDM_raw.txt"  # Adjust path as per your folder structure

def parse_line(line):
    try:
        parts = line.strip().strip(';').split(',')
        return [float(parts[-3]), float(parts[-2]), float(parts[-1])]  # X, Y, Z
    except Exception as e:
        print(f"[WARN] Skipping line due to parse error: {e}")
        return None

def main():
    window = []
    i = 1
    try:
        with open(file_path, "r") as file:
            for line in file:
                vec = parse_line(line)
                if vec is None:
                    continue

                window.append(vec)

                if len(window) == WINDOW_SIZE:
                    start = time.time()
                    results = model.predict(window)
                    duration = time.time() - start
                    print(f"🧠 Prediction {i:03d}: {results} | ⏱️ Time: {duration:.4f} sec")
                    i += 1
                    window.pop(0)  # Sliding window
    except FileNotFoundError:
        print(f"[ERROR] File not found: {file_path}")
    except Exception as e:
        print(f"[ERROR] Unexpected error: {e}")

if __name__ == "__main__":
    main()
