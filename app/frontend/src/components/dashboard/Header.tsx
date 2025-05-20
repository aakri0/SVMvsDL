
import React from 'react';
import { Activity } from 'lucide-react';

const Header = () => {
  return (
    <header className="flex items-center justify-between p-4 mb-6">
      <div className="flex items-center space-x-3">
        <Activity className="h-6 w-6 text-tech-primary" />
        <h1 className="text-2xl font-bold text-tech-text">Activity Recognition Dashboard</h1>
      </div>
      <div className="text-sm text-tech-muted">
        <span>Last updated: {new Date().toLocaleTimeString()}</span>
      </div>
    </header>
  );
};

export default Header;
