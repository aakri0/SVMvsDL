import requests
import time

WINDOW_SIZE = 50
file_path = "simulator/WISDM_raw.txt"  # Ensure this path is correct relative to where you run the script

def parse_line(line):
    try:
        parts = line.strip().strip(';').split(',')
        return [float(parts[-3]), float(parts[-2]), float(parts[-1])]  # X, Y, Z
    except Exception as e:
        print(f"[WARN] Skipping line due to parse error: {e}")
        return None

def send_prediction_to_server(window):
    try:
        res = requests.post("http://127.0.0.1:5000/api/predict", json={"window": window})
        if res.status_code == 200:
            print("Prediction sent:", res.json())
        else:
            print(f"[ERROR] Server responded with status {res.status_code}: {res.text}")
    except Exception as e:
        print(f"[ERROR] Could not send prediction: {e}")

def main():
    window = []

    try:
        with open(file_path, "r") as file:
            for line in file:
                vec = parse_line(line)
                if vec is None:
                    continue

                window.append(vec)

                if len(window) == WINDOW_SIZE:
                    send_prediction_to_server(window)
                    window.pop(0)  # Slide window

                time.sleep(0.1)  # Simulate real-time stream

    except FileNotFoundError:
        print(f"[ERROR] File not found: {file_path}")
    except Exception as e:
        print(f"[ERROR] Unexpected error: {e}")

if __name__ == "__main__":
    main()
