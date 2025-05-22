import React from 'react';
import { Activity } from 'lucide-react';

const Header = () => {
  return (
    <header className="flex items-center justify-between px-6 py-4 mb-6 bg-white shadow-sm rounded-xl">
      <div className="flex items-center space-x-3">
        <Activity className="h-6 w-6 text-purple-500" />
        <h1 className="text-2xl font-bold text-gray-800">Activity Recognition Dashboard</h1>
      </div>
      <div className="text-sm text-gray-500">
        <span>Last updated: {new Date().toLocaleTimeString()}</span>
      </div>
    </header>
  );
};

export default Header;
