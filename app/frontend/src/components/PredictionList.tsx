// src/components/PredictionList.tsx

import React from "react";

interface Prediction {
  id: string;
  user_id: string;
  activity: string;
  confidence: number;
  timestamp: any; // Firestore Timestamp or Date
}

interface PredictionListProps {
  predictions: Prediction[];
}

const PredictionList: React.FC<PredictionListProps> = ({ predictions }) => {
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-2">Recent Predictions</h2>
      <ul className="space-y-2">
        {predictions.map((p) => (
          <li key={p.id} className="border p-2 rounded shadow">
            <strong>User:</strong> {p.user_id} <br />
            <strong>Activity:</strong> {p.activity} <br />
            <strong>Confidence:</strong> {p.confidence}% <br />
            <em>
              {new Date(
                typeof p.timestamp?.toDate === "function"
                  ? p.timestamp.toDate()
                  : p.timestamp
              ).toLocaleString()}
            </em>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PredictionList;
