
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, Settings } from 'lucide-react';

type ControlPanelProps = {
  isStreaming: boolean;
  onToggleStreaming: () => void;
  onReset: () => void;
};

const ControlPanel = ({ isStreaming, onToggleStreaming, onReset }: ControlPanelProps) => {
  return (
    <Card className="shadow-sm transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium text-tech-text">Controls</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-3">
          <Button 
            onClick={onToggleStreaming}
            className={isStreaming ? 'bg-amber-500 hover:bg-amber-600' : 'bg-tech-accent hover:bg-blue-600'}
          >
            {isStreaming ? (
              <><Pause className="mr-2 h-4 w-4" /> Stop Streaming</>
            ) : (
              <><Play className="mr-2 h-4 w-4" /> Start Streaming</>
            )}
          </Button>
          <Button variant="outline" onClick={onReset} className="border-tech-primary text-tech-primary hover:bg-tech-primary hover:bg-opacity-10">
            <Settings className="mr-2 h-4 w-4" /> Reset Data
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ControlPanel;
