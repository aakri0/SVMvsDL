# 📊 SVM vs Deep Learning for Human Activity Recognition (HAR)

[![Python](https://img.shields.io/badge/Python-3.9%2B-blue)](https://www.python.org/)  
[![TensorFlow](https://img.shields.io/badge/TensorFlow-2.x-orange)](https://www.tensorflow.org/)  
[![Scikit-learn](https://img.shields.io/badge/Scikit--learn-1.x-green)](https://scikit-learn.org/)  
[![React](https://img.shields.io/badge/React-18.x-blue)](https://reactjs.org/)  
[![Firebase](https://img.shields.io/badge/Firebase-Backend-yellow)](https://firebase.google.com/)  

A comparative study between **Support Vector Machines (SVM)** and various **Deep Learning (DL)** architectures for the **WISDM Human Activity Recognition dataset**.  
The goal: **identify the most effective model for resource-constrained devices** while balancing accuracy, F1-score, latency, and memory usage.

---

## 📌 Project Overview

This project benchmarks multiple ML/DL approaches for **HAR**:
- **SVM** – Linear, RBF, Polynomial kernels
- **DNN** – Fully connected network
- **CNN**
- **LSTM**
- **CNN-LSTM Hybrid**

All models were **iteratively trained** to identify optimal parameters, then evaluated on:
- **Accuracy**
- **F1-score**
- **Latency**
- **Memory usage**
- **Activity-wise classification performance**

As an **extension**, we implemented a **real-time activity recognition pipeline** using:
- **ESP32** + **ADXL335 accelerometer**
- **Flask** backend
- **Firebase** database
- **React.js** frontend
- **WebSockets** for live updates

---

## 📂 Directory Structure

```
.
├── .ipynb_checkpoints/       # Jupyter auto-saves
├── app/                      # Full-stack real-time HAR app
│   ├── backend/              # Flask + Firebase backend
│   │   ├── firebase_client.py
│   │   ├── app.py
│   │   └── ...
│   └── frontend/             # React.js frontend
│       ├── react_app/
│       └── package.json
├── datasets/
│   └── WISDM/                 # WISDM dataset
├── f1_plot.pdf                # Model F1-score comparison
├── precision_plot.pdf         # Model precision comparison
├── SVMvsDL.ipynb              # Main training & evaluation notebook
├── SaveDatasetCSV.ipynb       # Script to preprocess & save dataset
├── requirements.txt           # Python dependencies
└── .gitignore
```

📎 Detailed activity-wise performance plots: [`f1_plot.pdf`](f1_plot.pdf), [`precision_plot.pdf`](precision_plot.pdf)

---

## ⚙️ Installation & Usage

### 1️⃣ Run the Research Notebook
```bash
# Clone repo
git clone https://github.com/yourusername/SVMvsDL.git
cd SVMvsDL

# Install dependencies
pip install -r requirements.txt

# Open the main Jupyter notebook
jupyter notebook SVMvsDL.ipynb
```

### 2️⃣ Run the Live Activity Recognition App

#### Backend
```bash
cd app/backend
python firebase_client.py  # Start Firebase sync
python app.py              # Start Flask server
```

#### Frontend
```bash
cd app/frontend/react_app
npm install
npm start
```

ESP32 will stream accelerometer data → Flask backend → Firebase → React UI (via WebSockets).

---

## 🛠️ Tech Stack

**ML/DL:** Python, TensorFlow/Keras, Scikit-learn, Pandas, NumPy, Matplotlib, Seaborn  
**IoT & Realtime:** ESP32, ADXL335 accelerometer, Flask, WebSockets, Firebase  
**Frontend:** React.js, Material UI  

---

