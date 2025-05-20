
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartBar } from 'lucide-react';

type Activity = 'walking' | 'running' | 'sitting' | 'standing' | 'lying';
type ActivityPredictionProps = {
  currentActivity: Activity | null;
  confidence: number;
};

const ActivityPrediction = ({ currentActivity, confidence }: ActivityPredictionProps) => {
  const getActivityEmoji = (activity: Activity | null): string => {
    switch (activity) {
      case 'walking': return '🚶';
      case 'running': return '🏃';
      case 'sitting': return '💺';
      case 'standing': return '🧍';
      case 'lying': return '🛌';
      default: return '❓';
    }
  };

  return (
    <Card className="shadow-sm transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium text-tech-text">Activity Recognition</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="text-4xl">{getActivityEmoji(currentActivity)}</div>
              <div className="font-semibold text-xl capitalize">
                {currentActivity || 'Unknown'}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <ChartBar className="h-5 w-5 text-tech-primary" />
              <span className="text-tech-primary font-medium">{confidence.toFixed(1)}% confidence</span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-tech-primary h-2.5 rounded-full transition-all duration-300 ease-in-out"
              style={{ width: `${confidence}%` }}
            ></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityPrediction;
