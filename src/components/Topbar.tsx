import React, { useState, useEffect } from "react";

export function Topbar() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dataSource, setDataSource] = useState<'mock' | 'google-sheets'>('mock');

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Check if Google Sheets is configured
    const apiKey = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY;
    const spreadsheetId = import.meta.env.VITE_SPREADSHEET_ID;
    
    if (apiKey && spreadsheetId) {
      setDataSource('google-sheets');
    } else {
      setDataSource('mock');
    }
  }, []);

  return (
    <header className="h-20 bg-white shadow-sm border-b border-gray-200 px-6 flex items-center justify-between">
      {/* Left Section */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full animate-pulse ${
              dataSource === 'google-sheets' ? 'bg-green-500' : 'bg-orange-500'
            }`}></div>
            <span className={`text-sm font-medium ${
              dataSource === 'google-sheets' ? 'text-green-600' : 'text-orange-600'
            }`}>
              {dataSource === 'google-sheets' ? 'Live Data' : 'Demo Data'}
            </span>
          </div>
          <div className="text-sm text-gray-500">
            Last sync: {currentTime.toLocaleTimeString()}
          </div>
          {dataSource === 'mock' && (
            <div className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
              Using Sample Data
            </div>
          )}
        </div>
      </div>

      {/* Center Section */}
      <div className="flex items-center space-x-6">
        <div className="text-center">
          <div className="text-sm font-medium text-gray-900">
            {currentTime.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
          <div className="text-lg font-bold text-gray-700">
            {currentTime.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
          <span className="text-xl">🔔</span>
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
            3
          </span>
        </button>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
        </div>

        {/* User Profile */}
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">Admin User</div>
            <div className="text-xs text-gray-500">Restaurant Manager</div>
          </div>
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
            A
          </div>
          <button className="text-gray-400 hover:text-gray-600">
            <span className="text-lg">▼</span>
          </button>
        </div>
      </div>
    </header>
  );
}