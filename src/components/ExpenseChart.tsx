import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { apiService } from "../services/api";
import { ExpenseDetails } from "./ExpenseDetails";
import { DateFilter } from "./DateFilter";

const COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#8B5A2B', '#6B7280', '#059669', '#DC2626', '#7C3AED', '#1D4ED8', '#047857', '#D97706', '#B91C1C'];

// Expected expense categories for validation
const EXPECTED_EXPENSE_CATEGORIES = [
  'Maintenance',
  'Marketing',
  'Automobile',
  'Equipment',
  'Insurance',
  'Sales Tax & CPA',
  'Payroll Other taxes',
  'Rent',
  'Utilities',
  'Misc',
  'Bank Fees',
  'LLC Fees',
  'Travel',
  'Food costs',
  'Salaries' // Added separately from salaries sheet
];

export function ExpenseChart() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [comparisonMode, setComparisonMode] = useState<'current' | 'yoy' | 'qoq'>('current');
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedCostType, setSelectedCostType] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState(new Date().toLocaleString('default', { month: 'short' }));
  const [missingCategories, setMissingCategories] = useState<string[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await apiService.getFinancialData(parseInt(selectedYear), selectedMonth);
        const { expenseBreakdown, salaryBreakdown } = response;
        
        // Group expenses by category
        const expenseByCategory: { [key: string]: number } = {};
        
        expenseBreakdown.forEach((item: any) => {
          const category = item.category || "Unknown";
          const amount = item.amount || 0;
          
          if (expenseByCategory[category]) {
            expenseByCategory[category] += amount;
          } else {
            expenseByCategory[category] = amount;
          }
        });

        // Add salaries as a separate category
        const totalSalaries = salaryBreakdown.reduce((sum: number, item: any) => {
          return sum + (item.amount || 0);
        }, 0);
        
        if (totalSalaries > 0) {
          expenseByCategory["Salaries"] = totalSalaries;
        }

        // Check for missing expected categories
        const foundCategories = Object.keys(expenseByCategory);
        const missing = EXPECTED_EXPENSE_CATEGORIES.filter(category => 
          !foundCategories.some(found => 
            found.toLowerCase().includes(category.toLowerCase()) ||
            category.toLowerCase().includes(found.toLowerCase())
          )
        );
        setMissingCategories(missing);
        
        // Convert to array and sort by descending amount
        const chartData = Object.entries(expenseByCategory)
          .map(([category, amount]) => ({
            costType: category,
            amount: Math.round(amount),
            percentage: 0,
          }))
          .sort((a, b) => b.amount - a.amount); // Sort by descending amount
        
        const total = Math.round(chartData.reduce((sum, item) => sum + item.amount, 0));
        const updatedData = chartData.map(item => ({
          ...item,
          percentage: total > 0 ? Math.round((item.amount / total) * 100) : 0
        }));
        
        setData(updatedData);
        setTotalExpenses(total);
        setLoading(false);
      } catch (error) {
        console.error('Error loading expense data:', error);
        setLoading(false);
      }
    }
    loadData();
  }, [selectedYear, selectedMonth]);

  const handleDrillDown = (costType: string) => {
    setSelectedCostType(costType);
    setShowDetails(true);
  };

  const handleBackToCostType = () => {
    setShowDetails(false);
    setSelectedCostType("");
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{payload[0].payload.costType}</p>
          <p className="text-red-600">
            Amount: <span className="font-bold">${payload[0].value.toLocaleString()}</span>
          </p>
          <p className="text-gray-600">
            Percentage: <span className="font-bold">{payload[0].payload.percentage}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap gap-2 mt-4">
        {payload?.map((entry: any, index: number) => (
          <div key={index} className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            ></div>
            <span className="text-sm text-gray-700">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <span className="text-sm text-gray-500">Loading expense data...</span>
        </div>
      </div>
    );
  }

  if (showDetails && selectedCostType) {
    return (
      <ExpenseDetails costType={selectedCostType} onBack={handleBackToCostType} />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Expense Analytics</h3>
          <p className="text-gray-600 mt-1">Expense breakdown and analysis (including salaries)</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Total Expenses</div>
          <div className="text-2xl font-bold text-red-600">${totalExpenses.toLocaleString()}</div>
        </div>
      </div>

      {/* Date Filters */}
      <div className="flex justify-between items-center">
        <DateFilter
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          onYearChange={setSelectedYear}
          onMonthChange={setSelectedMonth}
          className="flex-1"
        />
        <div className="text-sm text-gray-500">
          {selectedMonth ? `${selectedMonth} ${selectedYear}` : `${selectedYear} (All Months)`}
        </div>
      </div>

      {/* Missing Categories Warning */}
      {missingCategories.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-yellow-600">⚠️</span>
            <span className="text-sm font-medium text-yellow-800">Missing Expense Categories</span>
          </div>
          <p className="text-sm text-yellow-700 mb-2">
            The following expected expense categories were not found in the data:
          </p>
          <div className="flex flex-wrap gap-2">
            {missingCategories.map((category, index) => (
              <span key={index} className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                {category}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-xl border border-red-200">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-red-600">💸</span>
            <span className="text-sm font-medium text-red-800">Total Expenses</span>
          </div>
          <div className="text-xl font-bold text-red-900">${totalExpenses.toLocaleString()}</div>
          <div className="text-xs text-red-700 mt-1">
            {selectedMonth ? `${selectedMonth} ${selectedYear}` : `${selectedYear} total`}
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-orange-600">📊</span>
            <span className="text-sm font-medium text-orange-800">Categories</span>
          </div>
          <div className="text-xl font-bold text-orange-900">{data.length}</div>
          <div className="text-xs text-orange-700 mt-1">Cost types + Salaries</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-gray-50 rounded-xl p-4">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 text-center">Expense by Cost Type</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ costType, percentage }) => `${costType} ${percentage}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="amount"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="bg-gray-50 rounded-xl p-4">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 text-center">Expense Comparison</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="costType" 
                stroke="#6B7280"
                fontSize={10}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                stroke="#6B7280"
                fontSize={10}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="amount" 
                fill="#EF4444" 
                radius={[4, 4, 0, 0]}
                onClick={(data) => handleDrillDown(data.costType)}
                style={{ cursor: 'pointer' }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Expense List */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Expense Breakdown (Sorted by Amount)</h4>
        <div className="space-y-3">
          {data.map((item, index) => (
            <div 
              key={index} 
              className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              onClick={() => handleDrillDown(item.costType)}
            >
              <div className="flex items-center space-x-3">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></div>
                <div>
                  <p className="font-medium text-gray-900">{item.costType}</p>
                  <p className="text-sm text-gray-600">{item.percentage}% of total</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-red-600">${item.amount.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Click for details</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Expected Categories Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-blue-600">ℹ️</span>
          <span className="text-sm font-medium text-blue-800">Expected Expense Categories</span>
        </div>
        <p className="text-sm text-blue-700 mb-2">
          The dashboard is configured to track these expense categories:
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
          {EXPECTED_EXPENSE_CATEGORIES.map((category, index) => (
            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
              {category}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}