# SVM vs Deep Learning — Real-Time Human Activity Recognition

A full-stack human activity recognition (HAR) system that benchmarks classical machine learning (SVM) against deep learning (LSTM) on tri-axial accelerometer data, with a live inference pipeline driven by an ESP32 wearable.

The project covers the complete ML lifecycle: dataset preparation, model training and comparison in Jupyter, a Flask inference API, a real-time WebSocket ingestion server, a React/TypeScript dashboard, and embedded firmware for an ESP32-based wearable.

> **Status:** Research / academic project. Trained models, datasets, and a working end-to-end demo are included.

---

## Table of Contents

- [Highlights](#highlights)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Repository Layout](#repository-layout)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [1. Clone and bootstrap](#1-clone-and-bootstrap)
  - [2. Run the stack with one command](#2-run-the-stack-with-one-command)
  - [3. Backend (Flask + WebSocket)](#3-backend-flask--websocket)
  - [4. Frontend (React + Vite)](#4-frontend-react--vite)
  - [5. ESP32 firmware](#5-esp32-firmware)
  - [6. Notebooks (training & data prep)](#6-notebooks-training--data-prep)
- [REST API Reference](#rest-api-reference)
- [Dataset](#dataset)
- [Models](#models)
- [Configuration & Secrets](#configuration--secrets)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

---

## Highlights

- **Dual-model inference** — switch between SVM and LSTM at runtime via a single REST endpoint.
- **Real-time pipeline** — ESP32 streams 50 Hz accelerometer data over WebSocket; predictions are written to Firestore and pushed to the dashboard live.
- **Reproducible training** — Jupyter notebooks cover dataset windowing, feature engineering, hyperparameter search (GridSearchCV), LSTM/CNN architectures, and evaluation.
- **Six recognized activities** — Walking, Jogging, Standing, Sitting, Upstairs, Downstairs.
- **Polished frontend** — React 18 + TypeScript + Vite + TailwindCSS + shadcn/ui dashboard with charts (Recharts) and live state from Firestore.
- **Pluggable data source** — the inference server accepts both simulated WISDM samples and live ESP32 data.

## System Architecture

```
┌──────────────┐        ┌──────────────────┐        ┌──────────────────┐
│  ESP32 board │ ─────▶ │  WebSocket       │ ─────▶ │  Flask inference │
│  (3-axis     │  WS    │  server          │  HTTP  │  API             │
│  accel @50Hz)│        │  (port 5002)     │        │  (port 5001)     │
└──────────────┘        └──────────────────┘        └────────┬─────────┘
                                                             │
                                                             ▼
                                                    ┌──────────────────┐
                                                    │   Firestore      │
                                                    │   (predictions)  │
                                                    └────────┬─────────┘
                                                             │
                                                             ▼
                                                    ┌──────────────────┐
                                                    │  React dashboard │
                                                    │  (Vite dev: 8080)│
                                                    └──────────────────┘
```

A simulator (`app/backend/simulator`) can replace the ESP32 entirely, replaying the WISDM dataset over WebSocket so the rest of the stack works without hardware.

## Tech Stack

| Layer        | Technology                                                        |
|--------------|-------------------------------------------------------------------|
| ML / Models  | scikit-learn (SVM, GridSearchCV), TensorFlow / Keras (LSTM, CNN)  |
| Backend      | Python 3.10+, Flask 3, Flask-CORS, websockets, aiohttp            |
| Persistence  | Google Firestore (via `firebase-admin`)                           |
| Frontend     | React 18, TypeScript, Vite 5, TailwindCSS, shadcn/ui, Recharts    |
| Firmware     | Arduino C++ for ESP32 (`WebSocketsClient`, `WiFi`)                |
| Notebooks    | Jupyter, NumPy, pandas, matplotlib, seaborn, SciPy                |

## Repository Layout

```
SVMvsDL/
├── SVMvsDL.ipynb                # Model training & comparison notebook
├── SaveDatasetCSV.ipynb         # WISDM raw → tidy CSV conversion
├── requirements.txt             # Notebook / training dependencies
├── datasets/
│   └── WISDM/                   # Raw WISDM v1.1 data
├── scripts/
│   └── dev.sh                   # Start/stop/status helper for the stack
└── app/
    ├── backend/                 # Flask API + WebSocket ingestion
    │   ├── app.py               # Flask entrypoint (port 5001)
    │   ├── websocket_server.py  # Realtime ingestion (port 5002)
    │   ├── routes/predict.py    # /api/predict, /api/model
    │   ├── model/               # Trained .h5 / .pkl artifacts + loader
    │   ├── simulator/           # Replays WISDM data over WebSocket
    │   ├── switch_model.py      # Thread-safe active-model selector
    │   ├── firebase_client.py   # Firestore admin client
    │   └── requirements.txt     # Backend Python dependencies
    ├── frontend/                # React + Vite dashboard
    └── sketch_may16a/
        └── sketch_may16a.ino    # ESP32 firmware
```

## Getting Started

### Prerequisites

- **Python 3.10+** (TensorFlow 2.19 currently supports 3.10–3.12)
- **Node.js 18+** and **npm** (or `pnpm` / `bun`)
- **Arduino IDE** or **PlatformIO** with the ESP32 board package and the `WebSockets` library by Markus Sattler — only required if you want to use real hardware
- A **Firebase project** with Firestore enabled, plus:
  - A service-account JSON key (for the backend)
  - A web app config (for the frontend)

### 1. Clone and bootstrap

```bash
git clone https://github.com/aakri0/SVMvsDL.git
cd SVMvsDL
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r app/backend/requirements.txt
```

If you also intend to run the training notebooks:

```bash
pip install -r requirements.txt
```

### 2. Run the stack with one command

A helper script at [`scripts/dev.sh`](scripts/dev.sh) starts, stops, and inspects every service in the stack. PIDs and per-service log files are kept under `.run/` (gitignored).

```bash
./scripts/dev.sh start            # api + ws + frontend (the usual three)
./scripts/dev.sh status           # see what's running
./scripts/dev.sh logs api         # tail one service's log
./scripts/dev.sh stop             # stop everything that's running
./scripts/dev.sh restart frontend # restart a single service
```

Add `simulator` explicitly to replay the WISDM dataset over WebSocket when no hardware is connected:

```bash
./scripts/dev.sh start api ws simulator frontend
```

If you'd rather run each process in its own terminal, the manual commands are below.

### 3. Backend (Flask + WebSocket)

The backend is split into two cooperating processes:

| Process            | Command                                                  | Port |
|--------------------|----------------------------------------------------------|------|
| Flask inference API| `python -m app.backend.app`                              | 5001 |
| WebSocket ingest   | `python -m app.backend.websocket_server`                 | 5002 |
| WISDM simulator    | `python -m app.backend.simulator` (optional, no hardware)| —    |

> Run all commands from the **repo root** so the `app.backend...` package paths resolve.

Before starting, drop your Firebase service-account key into `app/backend/credentials/` (the directory is gitignored) and update `app/backend/firebase_client.py` to point at the file. See [Configuration & Secrets](#configuration--secrets).

### 4. Frontend (React + Vite)

```bash
cd app/frontend
npm install
cp .env.example .env       # then fill in your Firebase web config
npm run dev                # http://localhost:8080
```

Other scripts:

```bash
npm run build              # production build
npm run preview            # preview the production build
npm run lint               # eslint
```

### 5. ESP32 firmware

1. Open `app/sketch_may16a/sketch_may16a.ino` in the Arduino IDE.
2. Install the ESP32 board package (Boards Manager → "esp32") and the **WebSockets** library by Markus Sattler.
3. Update the `ssid`, `password`, and `host` constants at the top of the sketch:
   - `host` is the IP of the machine running `websocket_server.py`.
   - `port` defaults to `5000` in the firmware — change it to `5002` to match `websocket_server.py`, or update the server to listen on `5000`.
4. Wire a 3-axis analog accelerometer (e.g. ADXL335) to GPIOs 34 (X), 35 (Y), 32 (Z).
5. Flash the board. Watch the serial monitor at 115200 baud for connection status.

No hardware? Use the simulator instead — it produces the same WebSocket message format from the WISDM CSV.

### 6. Notebooks (training & data prep)

```bash
pip install -r requirements.txt
jupyter notebook
```

- `SaveDatasetCSV.ipynb` — converts `datasets/WISDM/WISDM_raw.txt` into a tidy CSV.
- `SVMvsDL.ipynb` — windows the data, extracts statistical features, trains and evaluates SVM (with `GridSearchCV`) and an LSTM (and a CNN baseline), and produces confusion matrices and classification reports for each.

Re-running the final cells will regenerate `LSTM_model_50.h5`, `SVM_model_50.pkl`, and `scaler_50.pkl` under `app/backend/model/`.

## REST API Reference

All endpoints are served by Flask on `http://localhost:5001`.

### `POST /api/predict`

Run inference on a 50-sample window of accelerometer readings.

Request:

```json
{
  "window": [[0.12, -0.98, 0.05], "...50 rows of [x, y, z]..."],
  "user_id": "user_1",
  "source": "simulated",
  "actual_activity": "Walking"
}
```

Response:

```json
{ "activity": "Walking", "accuracy": 0.9712 }
```

A document is also written to the `predictions` Firestore collection, including the active model, source, timestamp, and last sensor sample.

### `GET /api/model`

Returns the currently active model: `{"active_model": "lstm"}` or `"svm"`.

### `POST /api/model`

Switch the active model at runtime.

```json
{ "model_type": "svm" }
```

### `GET /test-firestore`

Smoke-test the Firestore connection by writing a sentinel document.

## Dataset

Models are trained on the [WISDM Activity Recognition v1.1](https://www.cis.fordham.edu/wisdm/dataset.php) dataset:

- 36 subjects, smartphone accelerometers at 20 Hz
- Labels: **Walking**, **Jogging**, **Standing**, **Sitting**, **Upstairs**, **Downstairs**
- Raw data lives at `datasets/WISDM/WISDM_raw.txt`

The training pipeline windows the signal (window size 50, stride 50), extracts per-axis statistical features (mean, std, min, max, median, energy = 18 features total), and z-scores them before fitting the SVM. The LSTM consumes the raw windowed signal directly.

## Models

| Model | Input shape | Notes                                                   |
|-------|-------------|---------------------------------------------------------|
| SVM   | `(18,)`     | RBF kernel; `C` and `gamma` tuned with `GridSearchCV`. Scaler saved as `scaler_50.pkl`. |
| LSTM  | `(50, 3)`   | 64–128 hidden units, dropout 0.3–0.5, early stopping.   |
| CNN   | `(50, 3)`   | Conv1D + MaxPooling baseline (notebook only, not deployed). |

Trained artifacts are committed under `app/backend/model/` so the API works out of the box.

## Configuration & Secrets

This repo never contains real credentials. You will need to provide your own.

**Backend — Firestore admin:**

1. In the Firebase console, generate a service account JSON key.
2. Either:
   - Save it to `app/backend/credentials/<anything>.json` — `firebase_client.py` auto-discovers any `*.json` in that folder (it is gitignored), or
   - Set `FIREBASE_CREDENTIALS=/absolute/path/to/key.json` in your environment.
3. Do **not** commit absolute paths or service-account keys.

**Frontend — Firestore web SDK:**

1. Copy `app/frontend/.env.example` to `app/frontend/.env`.
2. Fill in the values from your Firebase web app config.
3. `app/frontend/src/firebase.ts` reads from `import.meta.env.VITE_FIREBASE_*` — never commit a real `.env`.

**ESP32 — WiFi credentials:**

Edit the `ssid`, `password`, and `host` constants in `sketch_may16a.ino` locally; do not commit personal network credentials.

## Troubleshooting

- **`ModuleNotFoundError: app.backend...`** — run backend commands from the repo root, not from inside `app/backend/`.
- **WebSocket port mismatch** — the firmware ships pointing at port 5000 while `websocket_server.py` listens on 5002. Pick one and align both ends.
- **Firestore writes fail silently** — confirm the service account JSON exists at the path referenced by `firebase_client.py` and that the project ID matches the frontend config.
- **TensorFlow install errors on Apple Silicon** — install `tensorflow-macos` and `tensorflow-metal` instead of `tensorflow`.

## Contributing

Issues and pull requests are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, branching, commit conventions, and the review checklist.

## License

Released under the [MIT License](LICENSE).

## Acknowledgments

- [WISDM Lab](https://www.cis.fordham.edu/wisdm/) at Fordham University for the activity recognition dataset.
- The TensorFlow, scikit-learn, and shadcn/ui open-source communities.
- Originally co-developed as an academic project; this fork is maintained by [@aakri0](https://github.com/aakri0).
