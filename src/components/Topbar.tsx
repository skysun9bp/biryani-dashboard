import React from 'react';
import { User } from '../services/api';

interface TopbarProps {
  user: User | null;
  onLogout: () => void;
}

export default function Topbar({ user, onLogout }: TopbarProps) {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left side - Date and welcome */}
        <div className="flex items-center space-x-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Welcome back, {user?.name || 'User'}!
            </h2>
            <p className="text-sm text-gray-500">{currentDate}</p>
          </div>
        </div>

        {/* Right side - User menu and status */}
        <div className="flex items-center space-x-4">
          {/* Connection Status */}
          <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 rounded-full">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-xs font-medium text-green-800">Live Data</span>
          </div>

          {/* User Menu */}
          <div className="relative">
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.role}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">
                  {user?.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <button
                onClick={onLogout}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title="Sign out"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}