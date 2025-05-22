import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type SensorDataProps = {
  x: number;
  y: number;
  z: number;
};

const SensorData = ({ x, y, z }: SensorDataProps) => {
  return (
    <Card className="shadow-md rounded-xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-gray-800">Accelerometer Data</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col items-center justify-center bg-purple-100 p-4 rounded-lg">
            <span className="text-xs text-gray-500 mb-1">X-axis</span>
            <span className="text-2xl font-semibold text-purple-600">{x.toFixed(2)}</span>
          </div>
          <div className="flex flex-col items-center justify-center bg-violet-100 p-4 rounded-lg">
            <span className="text-xs text-gray-500 mb-1">Y-axis</span>
            <span className="text-2xl font-semibold text-violet-600">{y.toFixed(2)}</span>
          </div>
          <div className="flex flex-col items-center justify-center bg-sky-100 p-4 rounded-lg">
            <span className="text-xs text-gray-500 mb-1">Z-axis</span>
            <span className="text-2xl font-semibold text-sky-600">{z.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SensorData;
