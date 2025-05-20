import { useEffect, useState } from 'react'

function PredictionPanel() {
  const [prediction, setPrediction] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const interval = setInterval(() => {
      fetch('http://127.0.0.1:5000/api/predict-latest') // Adjust if needed
        .then((res) => res.json())
        .then((data) => {
          setPrediction(data);
        })
        .catch((err) => {
          setError("Failed to fetch prediction");
        });
    }, 1000); // Fetch every second

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: '1rem', textAlign: 'center' }}>
      <h2>📊 Activity Prediction</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {prediction ? (
        <div>
          <h3>🧠 {prediction.result || "Unknown Activity"}</h3>
          <p>Confidence: {prediction.confidence ? `${(prediction.confidence * 100).toFixed(2)}%` : "N/A"}</p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default PredictionPanel;
