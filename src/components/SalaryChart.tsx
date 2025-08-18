import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { apiService } from "../services/api";
import { DateFilter } from "./DateFilter";

const COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

export function SalaryChart() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalSalaries, setTotalSalaries] = useState(0);
  const [highestPaid, setHighestPaid] = useState("");
  const [averageSalary, setAverageSalary] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState<'current' | 'previous'>('current');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonthFilter, setSelectedMonthFilter] = useState(''); // Empty string means all months of current year

  useEffect(() => {
    async function loadData() {
      try {
        const response = await apiService.getFinancialData(parseInt(selectedYear), selectedMonthFilter);
        const { salaryBreakdown } = response;
        
        // Group salaries by employee
        const salaryByEmployee: { [key: string]: number } = {};
        
        salaryBreakdown.forEach((item: any) => {
          const employee = item.employee || "Unknown";
          const amount = item.amount || 0;
          
          if (salaryByEmployee[employee]) {
            salaryByEmployee[employee] += amount;
          } else {
            salaryByEmployee[employee] = amount;
          }
        });
        
        const chartData = Object.entries(salaryByEmployee).map(([employee, amount]) => ({
          employee: employee,
          salary: Math.round(amount),
          percentage: 0,
        }));
        
        const total = Math.round(chartData.reduce((sum, item) => sum + item.salary, 0));
        const avg = chartData.length > 0 ? Math.round(total / chartData.length) : 0;
        const updatedData = chartData.map(item => ({
          ...item,
          percentage: total > 0 ? Math.round((item.salary / total) * 100) : 0
        }));
        
        setData(updatedData);
        setTotalSalaries(total);
        setAverageSalary(avg);
        setHighestPaid(updatedData.length > 0 ? updatedData.reduce((max, item) => item.salary > max.salary ? item : max).employee : "N/A");
        setLoading(false);
      } catch (error) {
        console.error('Error loading salary data:', error);
        setLoading(false);
      }
    }
    loadData();
  }, [selectedMonth, selectedYear, selectedMonthFilter]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{payload[0].payload.employee}</p>
          <p className="text-purple-600">
            Salary: <span className="font-bold">${payload[0].value.toLocaleString()}</span>
          </p>
          <p className="text-gray-600">
            Percentage: <span className="font-bold">{payload[0].payload.percentage}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <span className="text-sm text-gray-500">Loading salary data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">
            {selectedMonth === 'current' ? "This Month's Salaries" : "Last Month's Salaries"}
          </h3>
          <p className="text-gray-600 mt-1">Staff compensation analysis</p>
          <div className="flex mt-3">
            <div className="flex bg-gray-200 rounded-lg p-1">
              <button
                onClick={() => setSelectedMonth('current')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  selectedMonth === 'current'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                This Month
              </button>
              <button
                onClick={() => setSelectedMonth('previous')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  selectedMonth === 'previous'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Last Month
              </button>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Month Payroll</div>
          <div className="text-2xl font-bold text-purple-600">${totalSalaries.toLocaleString()}</div>
        </div>
      </div>

      {/* Date Filters */}
      <div className="flex justify-between items-center">
        <DateFilter
          selectedYear={selectedYear}
          selectedMonth={selectedMonthFilter}
          onYearChange={setSelectedYear}
          onMonthChange={setSelectedMonthFilter}
          className="flex-1"
        />
        <div className="text-sm text-gray-500">
          {selectedMonthFilter ? `${selectedMonthFilter} ${selectedYear}` : `${selectedYear} (All Months)`}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-purple-600">💰</span>
            <span className="text-sm font-medium text-purple-800">Month Payroll</span>
          </div>
          <div className="text-xl font-bold text-purple-900">${totalSalaries.toLocaleString()}</div>
          <div className="text-xs text-purple-700 mt-1">
            {selectedMonthFilter ? `${selectedMonthFilter} ${selectedYear}` : `${selectedYear} total`}
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-blue-600">📊</span>
            <span className="text-sm font-medium text-blue-800">Average Salary</span>
          </div>
          <div className="text-xl font-bold text-blue-900">${averageSalary.toLocaleString()}</div>
          <div className="text-xs text-blue-700 mt-1">Per employee</div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-green-600">👑</span>
            <span className="text-sm font-medium text-green-800">Highest Paid</span>
          </div>
          <div className="text-lg font-bold text-green-900">{highestPaid}</div>
          <div className="text-xs text-green-700 mt-1">Top earner</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-gray-50 rounded-xl p-4">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 text-center">Salary Distribution</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="employee" 
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
              <Bar dataKey="salary" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-gray-50 rounded-xl p-4">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 text-center">Payroll Distribution</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ employee, percentage }) => `${employee} ${percentage}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="salary"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Employee Details */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Employee Details</h4>
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></div>
                <div>
                  <p className="font-medium text-gray-900">{item.employee}</p>
                  <p className="text-sm text-gray-600">{item.percentage}% of payroll</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-blue-600">${item.salary.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Monthly</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Salary Insights */}
      <div className="bg-blue-50 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <span className="text-blue-600 text-xl">💡</span>
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">Salary Insights</h4>
            <p className="text-sm text-blue-800">
              {highestPaid} is the highest-paid employee at ${data.find(item => item.employee === highestPaid)?.salary.toLocaleString()}. 
              The average salary across all employees is ${averageSalary.toLocaleString()}. 
              Consider performance-based incentives to motivate staff.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}