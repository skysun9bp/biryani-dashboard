import React from 'react';
import { User } from '../services/api';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  user: User | null;
  onLogout: () => void;
}

export default function Sidebar({ activeTab, onTabChange, user, onLogout }: SidebarProps) {
  const navigationItems = [
    {
      name: 'Dashboard',
      icon: '📊',
      tab: 'dashboard',
      description: 'Overview and analytics'
    },
    {
      name: 'Revenue',
      icon: '💰',
      tab: 'revenue',
      description: 'Revenue tracking and analysis'
    },
    {
      name: 'Expenses',
      icon: '💸',
      tab: 'expenses',
      description: 'Expense management'
    },
    {
      name: 'Salaries',
      icon: '👥',
      tab: 'salaries',
      description: 'Employee salary tracking'
    },
    {
      name: 'Data Entry',
      icon: '✏️',
      tab: 'data-entry',
      description: 'Add new entries'
    },
    {
      name: 'Reports',
      icon: '📈',
      tab: 'reports',
      description: 'Advanced analytics & trends'
    }
  ];

  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
            <span className="text-white font-bold text-sm">B</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Biryani</h1>
            <p className="text-sm text-gray-500">Dashboard</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      {user && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-blue-600 font-semibold text-sm">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user.email}
              </p>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                {user.role}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => (
          <button
            key={item.tab}
            onClick={() => onTabChange(item.tab)}
            className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
              activeTab === item.tab
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <span className="mr-3 text-lg">{item.icon}</span>
            <div className="text-left">
              <div className="font-medium">{item.name}</div>
              <div className="text-xs text-gray-500">{item.description}</div>
            </div>
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={onLogout}
          className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
        >
          <span className="mr-3">🚪</span>
          Sign Out
        </button>
      </div>

      {/* Connection Status */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center text-xs text-gray-500">
          <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
          Connected to Database
        </div>
      </div>
    </div>
  );
}