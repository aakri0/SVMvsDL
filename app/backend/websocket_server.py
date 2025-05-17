import asyncio
import websockets
import json
import requests

WINDOW_SIZE = 50
BUFFER = []

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
    print("✅ ESP32 connected")
    try:
        async for message in websocket:
            print(f"📥 Received: {message}")
            try:
                data = json.loads(message)
                x, y, z = data['x'], data['y'], data['z']
                BUFFER.append([x, y, z])

                if len(BUFFER) == WINDOW_SIZE:
                    await send_prediction(BUFFER.copy())
                    BUFFER.pop(0)  # sliding window
            except Exception as e:
                print(f"[WARN] Invalid message or parse error: {e}")
    except websockets.exceptions.ConnectionClosed as e:
        print(f"❌ Connection closed: {e}")

async def main():
    print("🚀 Starting WebSocket prediction server...")
    async with websockets.serve(handler, "0.0.0.0", 5000):
        print("🚀 WebSocket server running on ws://0.0.0.0:5000/")
        await asyncio.Future()

if __name__ == "__main__":
    asyncio.run(main())
