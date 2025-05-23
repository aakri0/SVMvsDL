import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { collection, query, orderBy, limit, onSnapshot, where } from "firebase/firestore";
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
  const [isSimulated, setIsSimulated] = useState(false); // false = live, true = simulator

  useEffect(() => {
    const sourceFilter = isSimulated ? "simulated" : "live";

    const q = query(
      collection(db, "predictions"),
      where("source", "==", sourceFilter),
      orderBy("timestamp", "desc"),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const preds = [];
      console.log(`⏳ Firestore snapshot received for source="${sourceFilter}"`);
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log("Document data:", data);  // Log each doc's data
        
        const sensor = data.sensor_data || {};

        let parsedTime: Date;
        if (data.timestamp?.toDate) {
          parsedTime = data.timestamp.toDate();
        } else if (typeof data.timestamp === "string") {
          parsedTime = new Date(data.timestamp);
        } else {
          parsedTime = new Date();
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

      console.log(`📥 Processed predictions array (${sourceFilter}):`, preds);
      setPredictions(preds);
    }, (error) => {
      console.error("Firestore onSnapshot error:", error);
    });

    return () => unsubscribe();
  }, [isSimulated]);

  const latestPrediction = predictions[0];

  // Reset handler: clear all prediction data
  const resetData = () => {
    setPredictions([]);
  };

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

                  {/* Toggle Switch for Live / Simulator */}
                  <div className="mb-4">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={isSimulated}
                        onChange={() => setIsSimulated(!isSimulated)}
                      />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 relative">
                        <span className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-5"></span>
                      </div>
                      <span className="ml-3 text-sm font-medium">
                        {isSimulated ? "Simulator Mode" : "Live Sensor Mode"}
                      </span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <StatusCard
                      isConnected={!isSimulated}
                      isSimulated={isSimulated}
                      batteryLevel={latestPrediction?.battery ?? 100}
                    />
                    <SensorData
                      x={latestPrediction?.accelX ?? 0}
                      y={latestPrediction?.accelY ?? 0}
                      z={latestPrediction?.accelZ ?? 0}
                    />
                  </div>

                  {/* Reset Button */}
                  <div className="flex justify-end mb-2">
                    <button
                      onClick={resetData}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                      aria-label="Reset data"
                    >
                      Reset Data
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ActivityPrediction
                      currentActivity={latestPrediction?.activity ?? "Unknown"}
                      confidence={(latestPrediction?.confidence ?? 0) * 100}
                    />
                    <AccelerometerGraph
                      data={predictions.map((p) => ({
                        x: p.accelX,
                        y: p.accelY,
                        z: p.accelZ,
                        time: p.time,
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
