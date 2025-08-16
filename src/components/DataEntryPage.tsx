import React, { useState, useEffect } from 'react';
import RevenueForm from './forms/RevenueForm';
import ExpenseForm from './forms/ExpenseForm';
import SalaryForm from './forms/SalaryForm';
import { apiService, RevenueEntry, ExpenseEntry, SalaryEntry } from '../services/api';

type FormType = 'revenue' | 'expense' | 'salary';

export default function DataEntryPage() {
  const [activeForm, setActiveForm] = useState<FormType>('revenue');
  const [costTypes, setCostTypes] = useState<string[]>([]);
  const [resourceNames, setResourceNames] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFormData();
  }, []);

  const loadFormData = async () => {
    try {
      setIsLoading(true);
      const [costTypesData, resourceNamesData] = await Promise.all([
        apiService.getCostTypes(),
        apiService.getResourceNames()
      ]);
      setCostTypes(costTypesData);
      setResourceNames(resourceNamesData);
    } catch (error) {
      console.error('Error loading form data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevenueSubmit = async (data: RevenueEntry) => {
    try {
      await apiService.createRevenueEntry(data);
      // Success message is handled by the form component
    } catch (error) {
      throw error; // Re-throw to let the form handle the error
    }
  };

  const handleExpenseSubmit = async (data: ExpenseEntry) => {
    try {
      await apiService.createExpenseEntry(data);
      // Success message is handled by the form component
    } catch (error) {
      throw error; // Re-throw to let the form handle the error
    }
  };

  const handleSalarySubmit = async (data: SalaryEntry) => {
    try {
      await apiService.createSalaryEntry(data);
      // Success message is handled by the form component
    } catch (error) {
      throw error; // Re-throw to let the form handle the error
    }
  };

  const formTabs = [
    { id: 'revenue', name: 'Revenue Entry', icon: '💰' },
    { id: 'expense', name: 'Expense Entry', icon: '💸' },
    { id: 'salary', name: 'Salary Entry', icon: '👥' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading form data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Data Entry</h1>
              <p className="mt-1 text-sm text-gray-500">
                Add new revenue, expense, and salary entries
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                Connected to Database
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {formTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveForm(tab.id as FormType)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeForm === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {activeForm === 'revenue' && (
          <RevenueForm onSubmit={handleRevenueSubmit} />
        )}
        
        {activeForm === 'expense' && (
          <ExpenseForm 
            onSubmit={handleExpenseSubmit} 
            costTypes={costTypes}
          />
        )}
        
        {activeForm === 'salary' && (
          <SalaryForm 
            onSubmit={handleSalarySubmit} 
            resourceNames={resourceNames}
          />
        )}
      </div>

      {/* Quick Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{costTypes.length}</div>
              <div className="text-sm text-gray-500">Cost Types Available</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{resourceNames.length}</div>
              <div className="text-sm text-gray-500">Employees Registered</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">3</div>
              <div className="text-sm text-gray-500">Entry Types</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
