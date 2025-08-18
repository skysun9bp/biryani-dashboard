
import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginForm from './components/forms/LoginForm';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import { SummaryCard } from './components/SummaryCard';
import { RevenueChart } from './components/RevenueChart';
import { ExpenseChart } from './components/ExpenseChart';
import { SalaryChart } from './components/SalaryChart';
import { ExportButton } from './components/ExportButton';
// Table components will be created later
import DataEntryPage from './components/DataEntryPage';
import { ReportsPage } from './components/ReportsPage';


type TabType = 'dashboard' | 'revenue' | 'expenses' | 'salaries' | 'data-entry' | 'reports';

function AppContent() {
  const { user, isAuthenticated, isLoading, logout, login } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<string>(''); // Empty string means all months for revenue analytics
  const [summaryMonth, setSummaryMonth] = useState<string>(new Date().toLocaleString('default', { month: 'short' })); // Current month for summary

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm onSubmit={async (data) => {
      await login(data.email, data.password);
    }} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <SummaryCard 
              selectedYear={selectedYear}
              selectedMonth={summaryMonth}
              onYearChange={setSelectedYear}
              onMonthChange={setSummaryMonth}
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RevenueChart 
                selectedYear={selectedYear}
                selectedMonth={selectedMonth}
                onYearChange={setSelectedYear}
                onMonthChange={setSelectedMonth}
              />
              <ExpenseChart 
                selectedYear={selectedYear}
                selectedMonth={selectedMonth}
                onYearChange={setSelectedYear}
                onMonthChange={setSelectedMonth}
              />
            </div>
            <SalaryChart 
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              onYearChange={setSelectedYear}
              onMonthChange={setSelectedMonth}
            />
            {/* Tables will be added in the reports section */}
            <ExportButton />
          </div>
        );
      case 'revenue':
        return (
          <div className="space-y-6">
            <RevenueChart 
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              onYearChange={setSelectedYear}
              onMonthChange={setSelectedMonth}
            />
            {/* Revenue table will be added in reports section */}
          </div>
        );
      case 'expenses':
        return (
          <div className="space-y-6">
            <ExpenseChart 
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              onYearChange={setSelectedYear}
              onMonthChange={setSelectedMonth}
            />
            {/* Expense table will be added in reports section */}
          </div>
        );
      case 'salaries':
        return (
          <div className="space-y-6">
            <SalaryChart 
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              onYearChange={setSelectedYear}
              onMonthChange={setSelectedMonth}
            />
            {/* Salary table will be added in reports section */}
          </div>
        );
      case 'data-entry':
        return <DataEntryPage />;
      case 'reports':
        return <ReportsPage />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        user={user}
        onLogout={logout}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar 
          user={user}
          onLogout={logout}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
