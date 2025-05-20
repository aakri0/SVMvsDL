
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wifi, WifiOff } from 'lucide-react';

type StatusCardProps = {
  isConnected: boolean;
  batteryLevel?: number;
};

const StatusCard = ({ isConnected, batteryLevel = 100 }: StatusCardProps) => {
  return (
    <Card className="shadow-sm transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium text-tech-text">Connection Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {isConnected ? (
              <>
                <Wifi className="h-6 w-6 text-green-500" />
                <span className="text-green-600 font-medium">Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="h-6 w-6 text-red-500" />
                <span className="text-red-600 font-medium">Disconnected</span>
              </>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-sm text-tech-muted">Battery:</div>
            <div className="w-16 bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${batteryLevel > 20 ? 'bg-green-500' : 'bg-red-500'}`}
                style={{ width: `${batteryLevel}%` }}
              ></div>
            </div>
            <div className="text-sm font-medium">{batteryLevel}%</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusCard;
