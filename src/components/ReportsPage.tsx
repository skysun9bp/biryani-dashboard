import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { apiService } from '../services/api';

interface FinancialData {
  revenue: number;
  expenses: number;
  salaries: number;
  netProfit: number;
  month: string;
  year: string;
}

interface ExpenseBreakdown {
  category: string;
  amount: number;
  percentage: number;
}

interface SalaryBreakdown {
  employee: string;
  amount: number;
  percentage: number;
}

export function ReportsPage() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState('');
  const [reportType, setReportType] = useState<'trends' | 'breakdown' | 'comparison'>('trends');
  const [financialData, setFinancialData] = useState<FinancialData[]>([]);
  const [expenseBreakdown, setExpenseBreakdown] = useState<ExpenseBreakdown[]>([]);
  const [salaryBreakdown, setSalaryBreakdown] = useState<SalaryBreakdown[]>([]);
  const [loading, setLoading] = useState(true);

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  useEffect(() => {
    loadReportData();
  }, [selectedYear, selectedMonth, reportType]);

  const loadReportData = async () => {
    setLoading(true);
    try {
      // Use apiService to get real data
      const data = await apiService.getFinancialData(selectedYear, selectedMonth);
      
      setFinancialData(data.financialData || []);
      setExpenseBreakdown(data.expenseBreakdown || []);
      setSalaryBreakdown(data.salaryBreakdown || []);
    } catch (error) {
      console.error('Error loading report data:', error);
      // Show error instead of falling back to mock data
      setFinancialData([]);
      setExpenseBreakdown([]);
      setSalaryBreakdown([]);
    }
    setLoading(false);
  };

  const generateMockFinancialData = (): FinancialData[] => {
    return months.map(month => ({
      revenue: Math.floor(Math.random() * 50000) + 20000,
      expenses: Math.floor(Math.random() * 30000) + 10000,
      salaries: Math.floor(Math.random() * 15000) + 8000,
      netProfit: 0,
      month,
      year: selectedYear.toString()
    })).map(item => ({
      ...item,
      netProfit: item.revenue - item.expenses - item.salaries
    }));
  };

  const generateMockExpenseBreakdown = (): ExpenseBreakdown[] => {
    const categories = ['Food & Beverage', 'Utilities', 'Rent', 'Marketing', 'Equipment', 'Insurance', 'Other'];
    const total = 50000;
    return categories.map(category => {
      const amount = Math.floor(Math.random() * 15000) + 2000;
      return {
        category,
        amount,
        percentage: Math.round((amount / total) * 100)
      };
    });
  };

  const generateMockSalaryBreakdown = (): SalaryBreakdown[] => {
    const employees = ['Manager', 'Chef', 'Server 1', 'Server 2', 'Cashier', 'Kitchen Staff'];
    const total = 25000;
    return employees.map(employee => {
      const amount = Math.floor(Math.random() * 8000) + 2000;
      return {
        employee,
        amount,
        percentage: Math.round((amount / total) * 100)
      };
    });
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Financial Reports & Analytics</h1>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Months</option>
              {months.map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as any)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="trends">Trends Analysis</option>
              <option value="breakdown">Breakdown Analysis</option>
              <option value="comparison">Comparison Analysis</option>
            </select>
          </div>
        </div>
      </div>

      {/* Trends Analysis */}
      {reportType === 'trends' && (
        <div className="space-y-6">
          {/* Revenue vs Expenses Trend */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Revenue vs Expenses Trend</h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={financialData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={3} name="Revenue" />
                <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={3} name="Expenses" />
                <Line type="monotone" dataKey="salaries" stroke="#F59E0B" strokeWidth={3} name="Salaries" />
                <Line type="monotone" dataKey="netProfit" stroke="#3B82F6" strokeWidth={3} name="Net Profit" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Performance */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Monthly Performance Overview</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expenses</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salaries</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Profit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit Margin</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {financialData.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.month}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">${item.revenue.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">${item.expenses.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600">${item.salaries.toLocaleString()}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${item.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${item.netProfit.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.revenue > 0 ? ((item.netProfit / item.revenue) * 100).toFixed(1) : 0}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Breakdown Analysis */}
      {reportType === 'breakdown' && (
        <div className="space-y-6">
          {/* Expense Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Expense Breakdown</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expenseBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, percentage }) => `${category}: ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {expenseBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Salary Breakdown</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salaryBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="employee" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  <Bar dataKey="amount" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Expense Details</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">%</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {expenseBreakdown.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm text-gray-900">{item.category}</td>
                        <td className="px-4 py-2 text-sm text-red-600">${item.amount.toLocaleString()}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{item.percentage}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Salary Details</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">%</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {salaryBreakdown.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm text-gray-900">{item.employee}</td>
                        <td className="px-4 py-2 text-sm text-orange-600">${item.amount.toLocaleString()}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{item.percentage}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Analysis */}
      {reportType === 'comparison' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Year-over-Year Comparison</h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={financialData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="revenue" fill="#10B981" name="Revenue" />
                <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
                <Bar dataKey="salaries" fill="#F59E0B" name="Salaries" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Key Metrics Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Revenue</h3>
              <p className="text-3xl font-bold text-green-600">
                ${financialData.reduce((sum, item) => sum + item.revenue, 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Expenses</h3>
              <p className="text-3xl font-bold text-red-600">
                ${financialData.reduce((sum, item) => sum + item.expenses, 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Salaries</h3>
              <p className="text-3xl font-bold text-orange-600">
                ${financialData.reduce((sum, item) => sum + item.salaries, 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Net Profit</h3>
              <p className="text-3xl font-bold text-blue-600">
                ${financialData.reduce((sum, item) => sum + item.netProfit, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
