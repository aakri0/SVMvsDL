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

// React Query client instance
const queryClient = new QueryClient();

type Activity = 
  | "walking" 
  | "running" 
  | "sitting" 
  | "standing" 
  | "lying" 
  | "downstairs" 
  | "upstairs";

// Import the Prediction type from PredictionList
import type { Prediction } from "@/components/PredictionList";

// Helper to safely convert string to Activity or null
const toActivity = (str?: string): Activity | null => {
  const activities = [
    "walking", 
    "running", 
    "sitting", 
    "standing", 
    "lying", 
    "downstairs", 
    "upstairs"
  ] as const;
  if (str && activities.includes(str as Activity)) {
    return str as Activity;
  }
  return null;
};

const App = () => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isSimulated, setIsSimulated] = useState(false);

  useEffect(() => {
    const sourceFilter = isSimulated ? "simulated" : "live";

    const q = query(
      collection(db, "predictions"),
      where("source", "==", sourceFilter),
      orderBy("timestamp", "desc"),
      limit(10)
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const preds: Prediction[] = [];
        console.log(`⏳ Firestore snapshot received for source="${sourceFilter}"`);

        querySnapshot.forEach((doc) => {
          const data = doc.data();

          console.log("Document data:", data);

          const sensor = data.sensor_data || {};

          // Ensure timestamp is parsed to Date
          let parsedTime: Date;
          if (data.timestamp?.toDate) {
            parsedTime = data.timestamp.toDate();
          } else if (typeof data.timestamp === "string") {
            parsedTime = new Date(data.timestamp);
          } else {
            parsedTime = new Date();
          }

          // Normalize activities to lowercase strings if present
          const rawActivity = data.activity ? String(data.activity).toLowerCase() : "unknown";
          const rawActualActivity = data.actual_activity ? String(data.actual_activity).toLowerCase() : undefined;

          preds.push({
            id: doc.id,
            user_id: data.user_id ?? "",
            activity: rawActivity,
            accuracy: data.accuracy ?? 0,
            actual_activity: rawActualActivity,
            timestamp: data.timestamp, // keep original Firestore Timestamp for PredictionList
            accelX: sensor.x ?? 0,
            accelY: sensor.y ?? 0,
            accelZ: sensor.z ?? 0,
            battery: data.battery,
            time: parsedTime, // for AccelerometerGraph usage
          });
        });

        console.log(`📥 Processed predictions array (${sourceFilter}):`, preds);
        setPredictions(preds);
      },
      (error) => {
        console.error("Firestore onSnapshot error:", error);
      }
    );

    return () => unsubscribe();
  }, [isSimulated]);

  const latestPrediction = predictions[0];

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

                  {/* Toggle Live / Simulator Mode */}
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
                      userId={latestPrediction?.user_id ?? ""}
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
                      activity={toActivity(latestPrediction?.activity) ?? null}
                      accuracy={(latestPrediction?.accuracy ?? 0) * 100}
                      actualActivity={isSimulated ? toActivity(latestPrediction?.actual_activity) ?? null : undefined}
                      isSimulated={isSimulated}
                    />

                    <AccelerometerGraph
                      data={predictions.map((p) => ({
                        x: p.accelX,
                        y: p.accelY,
                        z: p.accelZ,
                        time: p.time.toISOString(), // Use parsed Date for graph
                      }))}
                    />
                  </div>

                  <div className="mt-4">
                    <PredictionList predictions={predictions} isSimulated={isSimulated} />
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
