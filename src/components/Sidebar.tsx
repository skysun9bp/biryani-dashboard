import React, { useState, useEffect } from "react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [dataSource, setDataSource] = useState<'mock' | 'google-sheets'>('mock');

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "📊",
      description: "Overview & Analytics"
    },
    {
      id: "revenue",
      label: "Revenue",
      icon: "💰",
      description: "Sales & Income"
    },
    {
      id: "expenses",
      label: "Expenses",
      icon: "💸",
      description: "Costs & Outflows"
    },
    {
      id: "employees",
      label: "Employees",
      icon: "👥",
      description: "Staff & Salaries"
    },
    {
      id: "inventory",
      label: "Inventory",
      icon: "📦",
      description: "Stock & Supplies"
    },
    {
      id: "reports",
      label: "Reports",
      icon: "📈",
      description: "Analytics & Insights"
    },
    {
      id: "settings",
      label: "Settings",
      icon: "⚙️",
      description: "Configuration"
    }
  ];

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
    <aside className="w-80 bg-white shadow-xl border-r border-gray-200 min-h-screen">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center text-white text-xl font-bold">
            🍛
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Biryani House</h1>
            <p className="text-sm text-gray-500">Restaurant Dashboard</p>
          </div>
        </div>
      </div>

      {/* Data Source Indicator */}
      {dataSource === 'mock' && (
        <div className="p-4 border-b border-gray-200 bg-orange-50">
          <div className="flex items-start space-x-3">
            <span className="text-orange-600 text-lg">ℹ️</span>
            <div>
              <h3 className="text-sm font-semibold text-orange-900 mb-1">Demo Mode</h3>
              <p className="text-xs text-orange-800 mb-2">
                Currently using sample data. Connect to Google Sheets for real-time data.
              </p>
              <a 
                href="#google-sheets-setup" 
                className="text-xs text-orange-700 underline hover:text-orange-900"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Check GOOGLE_SHEETS_SETUP.md for setup instructions!');
                }}
              >
                Setup Guide →
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="p-4">
        <div className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                activeTab === item.id
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <div className="flex-1">
                <div className="font-medium">{item.label}</div>
                <div className={`text-xs ${
                  activeTab === item.id ? "text-blue-100" : "text-gray-500"
                }`}>
                  {item.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      </nav>

      {/* Quick Stats */}
      <div className="p-4 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Stats</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-green-600">📈</span>
              <span className="text-sm font-medium text-gray-700">Today's Sales</span>
            </div>
            <span className="text-sm font-bold text-green-600">$2,450</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-blue-600">👥</span>
              <span className="text-sm font-medium text-gray-700">Active Staff</span>
            </div>
            <span className="text-sm font-bold text-blue-600">8</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-orange-600">🍽️</span>
              <span className="text-sm font-medium text-gray-700">Orders Today</span>
            </div>
            <span className="text-sm font-bold text-orange-600">45</span>
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200 mt-auto">
        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
            A
          </div>
          <div className="flex-1">
            <div className="font-medium text-gray-900">Admin User</div>
            <div className="text-xs text-gray-500">Restaurant Manager</div>
          </div>
          <button className="text-gray-400 hover:text-gray-600">
            <span className="text-lg">⚙️</span>
          </button>
        </div>
      </div>
    </aside>
  );
}