// src/components/PredictionList.jsx
import React, { useEffect, useState } from "react";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

function PredictionList() {
  const [predictions, setPredictions] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "predictions"),
      orderBy("timestamp", "desc"),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const preds = [];
      querySnapshot.forEach((doc) => {
        preds.push({ id: doc.id, ...doc.data() });
      });
      setPredictions(preds);
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-2">Recent Predictions</h2>
      <ul className="space-y-2">
        {predictions.map((p) => (
          <li key={p.id} className="border p-2 rounded shadow">
            <strong>User:</strong> {p.user_id} <br />
            <strong>Activity:</strong> {p.activity} <br />
            <em>{new Date(p.timestamp).toLocaleString()}</em>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PredictionList;
