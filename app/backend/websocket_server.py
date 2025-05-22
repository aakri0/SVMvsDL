import asyncio
import websockets
import json
import requests
from datetime import datetime
from statistics import mean

WINDOW_SIZE = 50
PREDICTION_INTERVAL = 1
BUFFER = []
TIME_DELTAS = []
MAX_TIME_SAMPLES = 100

async def send_prediction(window):
    try:
        response = requests.post(
            "http://127.0.0.1:5001/api/predict",  # Make sure port matches Flask server
            json={"window": window}
        )
        if response.status_code == 200:
            prediction = response.json()
            print("📊 Prediction:", prediction.get("activity", "N/A"))
        else:
            print(f"[ERROR] Server responded with {response.status_code}: {response.text}")
    except Exception as e:
        print(f"[ERROR] Failed to send prediction: {e}")

async def handler(websocket):
    global TIME_DELTAS
    last_timestamp = None
    print("✅ ESP32 simulator connected")
    try:
        async for message in websocket:
            current_time = datetime.now()
            if last_timestamp:
                delta = (current_time - last_timestamp).total_seconds()
                TIME_DELTAS.append(delta)
                if len(TIME_DELTAS) > MAX_TIME_SAMPLES:
                    TIME_DELTAS.pop(0)
                avg_freq = 1 / mean(TIME_DELTAS)
                print(f"⏱️ Δt: {delta:.3f}s | 📡 Rate: {avg_freq:.2f} Hz")
            last_timestamp = current_time

            try:
                data = json.loads(message)
                x, y, z = data['x'], data['y'], data['z']
                BUFFER.append([x, y, z])
                if len(BUFFER) > 200:
                    BUFFER.pop(0)
            except Exception as e:
                print(f"[WARN] Invalid message: {e}")
    except websockets.exceptions.ConnectionClosed as e:
        print(f"❌ WebSocket closed: {e}")

async def predictor():
    while True:
        await asyncio.sleep(PREDICTION_INTERVAL)
        if len(BUFFER) >= WINDOW_SIZE:
            window = BUFFER[-WINDOW_SIZE:]
            print("🧠 Sending prediction window...")
            await send_prediction(window)

async def main():
    print("🚀 Starting WebSocket prediction server...")
    async with websockets.serve(handler, "0.0.0.0", 5002):
        print("🌐 Listening on ws://0.0.0.0:5002")
        await asyncio.gather(predictor())

if __name__ == "__main__":
    asyncio.run(main())
