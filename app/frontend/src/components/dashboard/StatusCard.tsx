import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wifi, WifiOff } from "lucide-react";

type StatusCardProps = {
  isConnected: boolean;
  batteryLevel?: number;
  isSimulated?: boolean;  // new prop to detect simulator mode
};

const StatusCard = ({
  isConnected,
  batteryLevel = 100,
  isSimulated = false,
}: StatusCardProps) => {
  return (
    <Card className="shadow-md rounded-xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-gray-800">
          Connection Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {isSimulated ? (
              <>
                <Wifi className="h-6 w-6 text-blue-500" />
                <span className="text-blue-600 font-medium">Simulated Data</span>
              </>
            ) : isConnected ? (
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

          {/* Hide battery status if simulated or batteryLevel missing */}
          {!isSimulated && batteryLevel != null && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Battery:</span>
              <div className="w-20 h-2 bg-gray-300 rounded-full overflow-hidden">
                <div
                  className={`h-2 ${
                    batteryLevel > 20 ? "bg-green-500" : "bg-red-500"
                  }`}
                  style={{ width: `${batteryLevel}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium">{batteryLevel.toFixed(1)}%</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusCard;
