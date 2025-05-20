
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type DataPoint = {
  time: string;
  x: number;
  y: number;
  z: number;
};

type AccelerometerGraphProps = {
  data: DataPoint[];
};

const AccelerometerGraph = ({ data }: AccelerometerGraphProps) => {
  return (
    <Card className="shadow-sm transition-all duration-200 hover:shadow-md h-[350px]">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium text-tech-text">Accelerometer Time Series</CardTitle>
      </CardHeader>
      <CardContent className="h-[calc(100%-60px)]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 0,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 12 }}
              minTickGap={30}
            />
            <YAxis domain={[-20, 20]} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #ddd' }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="x" 
              stroke="#9b87f5" 
              dot={false} 
              strokeWidth={2}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="y" 
              stroke="#7E69AB" 
              dot={false} 
              strokeWidth={2}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="z" 
              stroke="#0EA5E9" 
              dot={false} 
              strokeWidth={2}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default AccelerometerGraph;
