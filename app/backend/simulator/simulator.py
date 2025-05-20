import asyncio
import websockets
import sys
import os
import json
import time

# Fix import path to ensure ActivityModel can be found
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

WINDOW_SIZE = 50
file_path = "simulator/WISDM_raw.txt"  # Adjust if needed
SENSOR_DELAY = 0.02  # ~20ms delay to simulate 50Hz sensor

def parse_line(line):
    try:
        parts = line.strip().strip(';').split(',')
        return {"x": float(parts[-3]), "y": float(parts[-2]), "z": float(parts[-1])}
    except Exception as e:
        print(f"[WARN] Skipping line due to parse error: {e}")
        return None

async def simulate():
    try:
        async with websockets.connect("ws://localhost:5002") as websocket:
            print("✅ Simulator connected to WebSocket server")

            with open(file_path, "r") as file:
                for line in file:
                    data = parse_line(line)
                    if data:
                        await websocket.send(json.dumps(data))
                        print(f"📤 Sent: {data}")
                        await asyncio.sleep(SENSOR_DELAY)

            print("✅ Finished sending all sensor data.")

    except Exception as e:
        print(f"[ERROR] Failed to connect or send data: {e}")

if __name__ == "__main__":
    asyncio.run(simulate())
