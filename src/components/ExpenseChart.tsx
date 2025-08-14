import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { fetchSheetData } from "../utils/fetchSheet";
import { ExpenseDetails } from "./ExpenseDetails";

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316', '#84CC16', '#22C55E', '#06B6D4', '#0EA5E9', '#6366F1', '#A855F7', '#EC4899', '#F43F5E'];

export function ExpenseChart() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [largestExpense, setLargestExpense] = useState("");
  const [viewMode, setViewMode] = useState<'costType' | 'expenseType'>('costType');
  const [selectedCostType, setSelectedCostType] = useState<string | null>(null);
  const [comparisonMode, setComparisonMode] = useState<'current' | 'yoy' | 'qoq'>('current');
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    async function loadData() {
      const expenseData = await fetchSheetData("Expenses");
      
      // Get current date and calculate time periods
      const currentDate = new Date();
      const currentMonth = currentDate.toLocaleString('default', { month: 'short' });
      const currentYear = currentDate.getFullYear().toString();
      const currentQuarter = Math.ceil((currentDate.getMonth() + 1) / 3);
      
      // Filter data based on comparison mode
      let filteredData = [];
      let comparisonPeriodData = [];
      
      if (comparisonMode === 'current') {
        // Current month data
        filteredData = expenseData.filter(row => {
          const rowMonth = row["Month"] || "";
          const rowYear = row["Year"] || "";
          return rowMonth === currentMonth && rowYear === currentYear;
        });
      } else if (comparisonMode === 'yoy') {
        // Current month vs same month last year
        const lastYear = (parseInt(currentYear) - 1).toString();
        filteredData = expenseData.filter(row => {
          const rowMonth = row["Month"] || "";
          const rowYear = row["Year"] || "";
          return rowMonth === currentMonth && rowYear === currentYear;
        });
        comparisonPeriodData = expenseData.filter(row => {
          const rowMonth = row["Month"] || "";
          const rowYear = row["Year"] || "";
          return rowMonth === currentMonth && rowYear === lastYear;
        });
      } else if (comparisonMode === 'qoq') {
        // Current quarter vs previous quarter
        const previousQuarter = currentQuarter === 1 ? 4 : currentQuarter - 1;
        const previousQuarterYear = currentQuarter === 1 ? (parseInt(currentYear) - 1).toString() : currentYear;
        
        filteredData = expenseData.filter(row => {
          const rowYear = row["Year"] || "";
          if (rowYear !== currentYear) return false;
          const rowMonth = row["Month"] || "";
          const monthNum = new Date(`2024 ${rowMonth} 1`).getMonth() + 1;
          const rowQuarter = Math.ceil(monthNum / 3);
          return rowQuarter === currentQuarter;
        });
        
        comparisonPeriodData = expenseData.filter(row => {
          const rowYear = row["Year"] || "";
          if (rowYear !== previousQuarterYear) return false;
          const rowMonth = row["Month"] || "";
          const monthNum = new Date(`2024 ${rowMonth} 1`).getMonth() + 1;
          const rowQuarter = Math.ceil(monthNum / 3);
          return rowQuarter === previousQuarter;
        });
      }
      
      // Group expenses by Cost Type (main view)
      const expenseByCostType: { [key: string]: number } = {};
      const expenseByExpenseType: { [key: string]: number } = {};
      const expenseDetails: { [key: string]: any[] } = {};
      
      // Group expenses by Expense Type (drill-down view)
      const expenseByExpenseTypeDetailed: { [key: string]: number } = {};
      
      filteredData.forEach(item => {
        const costType = item["Cost Type"] || "Unknown";
        const expenseType = item["Expense Type"] || "Unknown";
        const amount = parseFloat(item["Amount"] || "0");
        const vendor = item["Item (Vendor)"] || "Unknown";
        const date = item["Date"] || "";
        
        // Group by Cost Type
        if (expenseByCostType[costType]) {
          expenseByCostType[costType] += amount;
        } else {
          expenseByCostType[costType] = amount;
        }
        
        // Store detailed expense data
        if (!expenseDetails[costType]) {
          expenseDetails[costType] = [];
        }
        expenseDetails[costType].push({
          expenseType,
          vendor,
          amount,
          date
        });
        
        // Group by Expense Type (for drill-down)
        if (selectedCostType && costType === selectedCostType) {
          if (expenseByExpenseTypeDetailed[expenseType]) {
            expenseByExpenseTypeDetailed[expenseType] += amount;
          } else {
            expenseByExpenseTypeDetailed[expenseType] = amount;
          }
        }
        
        // Group by Expense Type (for general view)
        if (expenseByExpenseType[expenseType]) {
          expenseByExpenseType[expenseType] += amount;
        } else {
          expenseByExpenseType[expenseType] = amount;
        }
      });
      
      // Calculate comparison data
      let comparisonBreakdown = null;
      if (comparisonPeriodData.length > 0) {
        const comparisonByCostType: { [key: string]: number } = {};
        comparisonPeriodData.forEach(item => {
          const costType = item["Cost Type"] || "Unknown";
          const amount = parseFloat(item["Amount"] || "0");
          if (comparisonByCostType[costType]) {
            comparisonByCostType[costType] += amount;
          } else {
            comparisonByCostType[costType] = amount;
          }
        });
        comparisonBreakdown = comparisonByCostType;
      }
      
      // Use appropriate data based on view mode
      const sourceData = viewMode === 'costType' ? expenseByCostType : 
                        (selectedCostType ? expenseByExpenseTypeDetailed : expenseByExpenseType);
      
      const chartData = Object.entries(sourceData).map(([category, amount]) => ({
        name: category,
        value: amount,
        percentage: 0,
      }));
      
      const total = chartData.reduce((sum, item) => sum + item.value, 0);
      const updatedData = chartData.map(item => ({
        ...item,
        percentage: total > 0 ? ((item.value / total) * 100).toFixed(1) : "0"
      }));
      
      setData(updatedData);
      setTotalExpenses(total);
      setLargestExpense(updatedData.reduce((max, item) => item.value > max.value ? item : max).name);
      setComparisonData(comparisonBreakdown);
      setLoading(false);
    }
    loadData();
  }, [viewMode, selectedCostType, comparisonMode]);

  const handleDrillDown = (costType: string) => {
    setSelectedCostType(costType);
    setShowDetails(true);
  };

  const handleBackToCostType = () => {
    setSelectedCostType(null);
    setViewMode('costType');
    setShowDetails(false);
  };

  const getComparisonText = () => {
    if (comparisonMode === 'yoy') return 'Year over Year';
    if (comparisonMode === 'qoq') return 'Quarter over Quarter';
    return 'Current Period';
  };

  const getComparisonChange = (costType: string) => {
    if (!comparisonData || !comparisonData[costType]) return null;
    const current = data.find(item => item.name === costType)?.value || 0;
    const previous = comparisonData[costType];
    const change = ((current - previous) / previous) * 100;
    return {
      change,
      isPositive: change > 0,
      current,
      previous
    };
  };

  // Show expense details if a cost type is selected
  if (showDetails && selectedCostType) {
    return (
      <ExpenseDetails 
        costType={selectedCostType} 
        onBack={handleBackToCostType} 
      />
    );
  }

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

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const comparison = getComparisonChange(payload[0].name);
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{payload[0].name}</p>
          <p className="text-red-600">
            Amount: <span className="font-bold">${payload[0].value.toLocaleString()}</span>
          </p>
          <p className="text-gray-600">
            Percentage: <span className="font-bold">{payload[0].payload.percentage}%</span>
          </p>
          {comparison && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <p className={`text-sm ${comparison.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {comparison.isPositive ? '↗' : '↘'} {Math.abs(comparison.change).toFixed(1)}% vs previous
              </p>
            </div>
          )}
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Expense Management</h3>
          <p className="text-gray-600 mt-1">
            {viewMode === 'costType' ? 'Cost analysis by category' : `Expense details for ${selectedCostType}`}
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">{getComparisonText()}</div>
          <div className="text-2xl font-bold text-red-600">${totalExpenses.toLocaleString()}</div>
        </div>
      </div>

      {/* Comparison Mode Toggle */}
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-gray-700">Compare:</span>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setComparisonMode('current')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              comparisonMode === 'current'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Current
          </button>
          <button
            onClick={() => setComparisonMode('yoy')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              comparisonMode === 'yoy'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            YoY
          </button>
          <button
            onClick={() => setComparisonMode('qoq')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              comparisonMode === 'qoq'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            QoQ
          </button>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-gray-700">View by:</span>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('costType')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'costType'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Cost Type
          </button>
          <button
            onClick={() => setViewMode('expenseType')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'expenseType'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Expense Type
          </button>
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
          <div className="text-xs text-red-700 mt-1">{getComparisonText()}</div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-orange-600">📊</span>
            <span className="text-sm font-medium text-orange-800">Largest Category</span>
          </div>
          <div className="text-lg font-bold text-orange-900">{largestExpense}</div>
          <div className="text-xs text-orange-700 mt-1">Highest expense category</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-gray-50 rounded-xl p-4">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            {viewMode === 'costType' ? 'Expense by Cost Type' : 'Expense by Type'}
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name} ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
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
          <h4 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            {viewMode === 'costType' ? 'Expense by Cost Type' : 'Expense by Type'}
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="name" 
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
              <Bar dataKey="value" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Expense List */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          {viewMode === 'costType' ? 'Cost Type Details' : 'Expense Type Details'}
        </h4>
        <div className="space-y-3">
          {data.map((item, index) => {
            const comparison = getComparisonChange(item.name);
            return (
              <div 
                key={index} 
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => viewMode === 'costType' && handleDrillDown(item.name)}
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.percentage}% of total</p>
                    {comparison && (
                      <p className={`text-xs ${comparison.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {comparison.isPositive ? '↗' : '↘'} {Math.abs(comparison.change).toFixed(1)}% vs previous
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-red-600">${item.value.toLocaleString()}</p>
                  {viewMode === 'costType' && (
                    <p className="text-xs text-gray-500">Click for details</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fixed Help Text */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <span className="text-red-600 text-xl">💡</span>
          <div>
            <h4 className="font-semibold text-red-900 mb-1">Expense Insights</h4>
            <p className="text-sm text-red-800">
              {largestExpense} accounts for the highest expense at ${data.find(item => item.name === largestExpense)?.value.toLocaleString()}. 
              {viewMode === 'costType' ? ' Click on any cost type to see detailed expense breakdown.' : ' Consider optimizing costs in this category to improve profitability.'}
              {comparisonMode !== 'current' && ' Use comparison modes to track expense trends over time.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}