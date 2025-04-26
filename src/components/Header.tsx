import React from 'react';
import { BarChart3 } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-xl shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <BarChart3 className="h-10 w-10" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Insurance Call Analytics</h1>
            <p className="text-blue-100 mt-1">Interactive visualization dashboard</p>
          </div>
        </div>
        <div className="hidden md:block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
          <p className="text-sm font-medium">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </header>
  );
};

export default Header;