
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type SensorDataProps = {
  x: number;
  y: number;
  z: number;
};

const SensorData = ({ x, y, z }: SensorDataProps) => {
  return (
    <Card className="shadow-sm transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium text-tech-text">Accelerometer Data</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col items-center justify-center bg-tech-primary bg-opacity-10 p-4 rounded-lg">
            <span className="text-xs text-tech-muted mb-1">X-axis</span>
            <span className="text-2xl font-semibold text-tech-primary">{x.toFixed(2)}</span>
          </div>
          <div className="flex flex-col items-center justify-center bg-tech-secondary bg-opacity-10 p-4 rounded-lg">
            <span className="text-xs text-tech-muted mb-1">Y-axis</span>
            <span className="text-2xl font-semibold text-tech-secondary">{y.toFixed(2)}</span>
          </div>
          <div className="flex flex-col items-center justify-center bg-tech-accent bg-opacity-10 p-4 rounded-lg">
            <span className="text-xs text-tech-muted mb-1">Z-axis</span>
            <span className="text-2xl font-semibold text-tech-accent">{z.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SensorData;
