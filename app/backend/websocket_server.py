import asyncio
import websockets
import json
import requests
from datetime import datetime
from statistics import mean

WINDOW_SIZE = 50               # Number of samples for each prediction window
PREDICTION_INTERVAL = 1        # Predict every 1 second
BUFFER = []                    # Sliding window buffer
TIME_DELTAS = []               # For calculating sending frequency
MAX_TIME_SAMPLES = 100         # Rolling average length for time deltas

async def send_prediction(window):
    try:
        response = requests.post(
            "http://127.0.0.1:5000/api/predict",
            json={"window": window}
        )
        if response.status_code == 200:
            print("📊 Prediction:", response.json())
        else:
            print(f"[ERROR] Server responded with {response.status_code}: {response.text}")
    except Exception as e:
        print(f"[ERROR] Failed to send prediction: {e}")

async def handler(websocket):
    global TIME_DELTAS
    last_timestamp = None

    print("✅ ESP32 connected")
    try:
        async for message in websocket:
            current_time = datetime.now()
            if last_timestamp:
                delta = (current_time - last_timestamp).total_seconds()
                TIME_DELTAS.append(delta)
                if len(TIME_DELTAS) > MAX_TIME_SAMPLES:
                    TIME_DELTAS.pop(0)
                avg_freq = 1 / mean(TIME_DELTAS)
                print(f"⏱️ Δt: {delta:.3f}s | 📡 Estimated Rate: {avg_freq:.2f} Hz")
            last_timestamp = current_time

            print(f"📥 Received: {message}")
            try:
                data = json.loads(message)
                x, y, z = data['x'], data['y'], data['z']
                BUFFER.append([x, y, z])
                if len(BUFFER) > 200:  # Limit buffer size to avoid memory issues
                    BUFFER.pop(0)
            except Exception as e:
                print(f"[WARN] Invalid message or parse error: {e}")
    except websockets.exceptions.ConnectionClosed as e:
        print(f"❌ Connection closed: {e}")

async def predictor():
    while True:
        await asyncio.sleep(PREDICTION_INTERVAL)
        if len(BUFFER) >= WINDOW_SIZE:
            window = BUFFER[-WINDOW_SIZE:]  # Use the latest WINDOW_SIZE samples
            print("🧠 Sending prediction window...")
            await send_prediction(window)

async def main():
    print("🚀 Starting WebSocket prediction server...")
    async with websockets.serve(handler, "0.0.0.0", 5002):
        print("🌐 WebSocket server running on ws://0.0.0.0:5002/")
        await asyncio.gather(predictor())

if __name__ == "__main__":
    asyncio.run(main())
