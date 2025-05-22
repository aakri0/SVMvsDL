import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";

// Simplified UI components
import PredictionList from "./components/PredictionList";
import Header from "@/components/dashboard/Header";
import StatusCard from "@/components/dashboard/StatusCard";
import SensorData from "@/components/dashboard/SensorData";
import ActivityPrediction from "@/components/dashboard/ActivityPrediction";
import AccelerometerGraph from "@/components/dashboard/AccelerometerGraph";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
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
        const data = doc.data();
        const sensor = data.sensor_data || {};

        let parsedTime: Date;

        // 🔁 Handle Firestore Timestamp or string timestamp
        if (data.timestamp?.toDate) {
          parsedTime = data.timestamp.toDate();
        } else if (typeof data.timestamp === "string") {
          parsedTime = new Date(data.timestamp);
        } else {
          parsedTime = new Date(); // fallback
        }

        preds.push({
          id: doc.id,
          ...data,
          accelX: sensor.x ?? 0,
          accelY: sensor.y ?? 0,
          accelZ: sensor.z ?? 0,
          time: parsedTime,
        });
      });

      setPredictions(preds);
      console.log("📥 Firestore snapshot updated:", preds);
    });

    return () => unsubscribe();
  }, []);

  const latestPrediction = predictions[0];

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                <div className="min-h-screen bg-background text-foreground p-4 space-y-4">
                  <Header />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <StatusCard isConnected={true} />
                    <SensorData
                      x={latestPrediction?.accelX ?? 0}
                      y={latestPrediction?.accelY ?? 0}
                      z={latestPrediction?.accelZ ?? 0}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ActivityPrediction
                      currentActivity={latestPrediction?.activity ?? "Unknown"}
                      confidence={latestPrediction?.confidence ?? 0}
                    />
                    <AccelerometerGraph
                      data={predictions.map((p) => ({
                        x: p.accelX,
                        y: p.accelY,
                        z: p.accelZ,
                        time: p.time, // ⬅️ unified format
                      }))}
                    />
                  </div>

                  <div className="mt-4">
                    <PredictionList predictions={predictions} />
                  </div>
                </div>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
