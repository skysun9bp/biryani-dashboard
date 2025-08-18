import React, { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { apiService } from "../services/api";
import { DateFilter } from "./DateFilter";

const COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

export function RevenueChart() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [netIncome, setNetIncome] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedDateDetails, setSelectedDateDetails] = useState<any>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState(new Date().toLocaleString('default', { month: 'short' }));

  useEffect(() => {
    async function loadData() {
      try {
        const response = await apiService.getFinancialData(parseInt(selectedYear), selectedMonth);
        const { financialData } = response;
        
        // Process API data for charts
        const processedData = financialData.map((item: any) => ({
          date: `${item.month} ${item.year}`,
          revenue: item.revenue || 0,
          netIncome: item.netProfit || 0,
          details: {
            "Revenue": item.revenue || 0
          },
          netIncomeDetails: {
            "Net Profit": item.netProfit || 0
          }
        }));

        setData(processedData);
        
        // Calculate totals
        const totalRev = processedData.reduce((sum, item) => sum + item.revenue, 0);
        const totalNetIncome = processedData.reduce((sum, item) => sum + item.netIncome, 0);
        
        setTotalRevenue(totalRev);
        setNetIncome(totalNetIncome);
        setLoading(false);
      } catch (error) {
        console.error('Error loading revenue data:', error);
        setLoading(false);
      }
    }

    loadData();
  }, [selectedYear, selectedMonth]);

  const handleDateClick = (data: any) => {
    setSelectedDate(data.date);
    setSelectedDateDetails(data);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          <p className="text-green-600">
            Revenue: <span className="font-bold">${payload[0].value.toLocaleString()}</span>
          </p>
          <p className="text-purple-600">
            Net Income: <span className="font-bold">${payload[1].value.toLocaleString()}</span>
          </p>
          <button
            onClick={() => handleDateClick({ date: label, ...payload[0].payload })}
            className="mt-2 px-3 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 transition-colors"
          >
            Click for details
          </button>
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
          <span className="text-sm text-gray-500">Loading revenue data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Revenue Analytics</h3>
          <p className="text-gray-600 mt-1">Revenue trends and analysis</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Total Revenue</div>
          <div className="text-2xl font-bold text-green-600">${totalRevenue.toLocaleString()}</div>
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
        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-green-600">💰</span>
            <span className="text-sm font-medium text-green-800">Total Revenue</span>
          </div>
          <div className="text-xl font-bold text-green-900">${totalRevenue.toLocaleString()}</div>
          <div className="text-xs text-green-700 mt-1">
            {selectedMonth ? `${selectedMonth} ${selectedYear}` : `${selectedYear} total`}
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-purple-600">📈</span>
            <span className="text-sm font-medium text-purple-800">Net Income</span>
          </div>
          <div className="text-xl font-bold text-purple-900">${netIncome.toLocaleString()}</div>
          <div className="text-xs text-purple-700 mt-1">
            {selectedMonth ? `${selectedMonth} ${selectedYear}` : `${selectedYear} total`}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Revenue vs Net Income Trend</h4>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stackId="1"
              stroke="#10B981" 
              fill="#10B981" 
              fillOpacity={0.6}
            />
            <Area 
              type="monotone" 
              dataKey="netIncome" 
              stackId="1"
              stroke="#8B5CF6" 
              fill="#8B5CF6" 
              fillOpacity={0.6}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Selected Date Details */}
      {selectedDateDetails && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-start mb-4">
            <h4 className="text-lg font-semibold text-gray-900">Details for {selectedDate}</h4>
            <button
              onClick={() => setSelectedDateDetails(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="font-medium text-gray-900 mb-3">Revenue Breakdown</h5>
              {Object.entries(selectedDateDetails.details).map(([key, value]: [string, any]) => (
                <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">{key}</span>
                  <span className="font-medium text-green-600">${value.toLocaleString()}</span>
                </div>
              ))}
            </div>
            
            <div>
              <h5 className="font-medium text-gray-900 mb-3">Net Income Breakdown</h5>
              {Object.entries(selectedDateDetails.netIncomeDetails).map(([key, value]: [string, any]) => (
                <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">{key}</span>
                  <span className="font-medium text-purple-600">${value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}