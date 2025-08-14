import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { fetchSheetData } from "../utils/fetchSheet";
import { ExpenseDetails } from "./ExpenseDetails";
import { DateFilter } from "./DateFilter";

const COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#8B5A2B', '#6B7280', '#059669', '#DC2626'];

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

  useEffect(() => {
    async function loadData() {
      const expenseData = await fetchSheetData("Expenses");
      
      // Filter data based on selected year and month
      let filteredData = expenseData.filter(row => {
        const rowYear = row["Year"] || "";
        const rowMonth = row["Month"] || "";
        
        if (selectedMonth) {
          return rowYear === selectedYear && rowMonth === selectedMonth;
        } else {
          return rowYear === selectedYear;
        }
      });

      // Group expenses by Cost Type
      const expenseByCostType: { [key: string]: number } = {};
      
      filteredData.forEach(item => {
        const costType = item["Cost Type"] || "Unknown";
        const amount = parseFloat(item["Amount"] || "0");
        
        if (expenseByCostType[costType]) {
          expenseByCostType[costType] += amount;
        } else {
          expenseByCostType[costType] = amount;
        }
      });
      
      const chartData = Object.entries(expenseByCostType).map(([costType, amount]) => ({
        costType: costType,
        amount: amount,
        percentage: 0,
      }));
      
      const total = chartData.reduce((sum, item) => sum + item.amount, 0);
      const updatedData = chartData.map(item => ({
        ...item,
        percentage: total > 0 ? ((item.amount / total) * 100).toFixed(1) : "0"
      }));
      
      setData(updatedData);
      setTotalExpenses(total);
      setLoading(false);
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
          <p className="text-gray-600 mt-1">Expense breakdown and analysis</p>
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
          <div className="text-xs text-orange-700 mt-1">Cost types</div>
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
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Expense Breakdown</h4>
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
    </div>
  );
}