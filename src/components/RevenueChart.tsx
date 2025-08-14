import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart, BarChart, Bar } from "recharts";
import { fetchSheetData } from "../utils/fetchSheet";

export function RevenueChart() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalNetIncome, setTotalNetIncome] = useState(0);
  const [timePeriod, setTimePeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedDateDetails, setSelectedDateDetails] = useState<any | null>(null);

  useEffect(() => {
    async function loadData() {
      const revenueData = await fetchSheetData("Net Sale");
      
      // Get current date and calculate time period
      const currentDate = new Date();
      let filteredData = [];
      
      if (timePeriod === 'month') {
        const currentMonth = currentDate.toLocaleString('default', { month: 'short' });
        const currentYear = currentDate.getFullYear().toString();
        filteredData = revenueData.filter(row => {
          const rowMonth = row["Month"] || "";
          const rowYear = row["Year"] || "";
          return rowMonth === currentMonth && rowYear === currentYear;
        });
      } else if (timePeriod === 'quarter') {
        const currentQuarter = Math.ceil((currentDate.getMonth() + 1) / 3);
        const currentYear = currentDate.getFullYear().toString();
        filteredData = revenueData.filter(row => {
          const rowYear = row["Year"] || "";
          if (rowYear !== currentYear) return false;
          const rowMonth = row["Month"] || "";
          const monthNum = new Date(`2024 ${rowMonth} 1`).getMonth() + 1;
          const rowQuarter = Math.ceil(monthNum / 3);
          return rowQuarter === currentQuarter;
        });
      } else if (timePeriod === 'year') {
        const currentYear = currentDate.getFullYear().toString();
        filteredData = revenueData.filter(row => {
          const rowYear = row["Year"] || "";
          return rowYear === currentYear;
        });
      }
      
      // Process data to work with actual column names
      const chartData = filteredData.map((item, index) => {
        // Calculate total revenue for each row - only specific columns
        const cashInReport = parseFloat(item["Cash in Report"] || "0");
        const card = parseFloat(item["Card"] || "0");
        const dd = parseFloat(item["DD"] || "0");
        const ue = parseFloat(item["UE"] || "0");
        const gh = parseFloat(item["GH"] || "0");
        const cn = parseFloat(item["CN"] || "0");
        const catering = parseFloat(item["Catering"] || "0");
        const otherCash = parseFloat(item["Other Cash"] || "0");
        const foodja = parseFloat(item["Foodja"] || "0");
        const zelle = parseFloat(item["Zelle"] || "0");
        const ezCater = parseFloat(item["Ez Cater"] || "0");
        const relish = parseFloat(item["Relish"] || "0");
        const waiterCom = parseFloat(item["waiter.com"] || "0");
        
        const totalRevenue = cashInReport + card + dd + ue + gh + cn + catering + otherCash + foodja + zelle + ezCater + relish + waiterCom;
        
        // Calculate net income - using different columns
        const card2 = parseFloat(item["Card2"] || "0");
        const dd2 = parseFloat(item["DD2"] || "0");
        const ue2 = parseFloat(item["UE2"] || "0");
        const gh2 = parseFloat(item["GH2"] || "0");
        const catering2 = parseFloat(item["Catering"] || "0"); // Using same catering column
        const otherCash2 = parseFloat(item["Other Cash"] || "0"); // Using same other cash column
        const foodja2 = parseFloat(item["Foodja2"] || "0");
        const ezCater2 = parseFloat(item["EzCater2"] || "0");
        const relish2 = parseFloat(item["Relish2"] || "0");
        const waiterCom2 = parseFloat(item["waiter.com2"] || "0");
        const cashInReport2 = parseFloat(item["Cash in Report"] || "0"); // Using same cash in report column
        
        const netIncome = card2 + dd2 + ue2 + gh2 + catering2 + otherCash2 + foodja2 + ezCater2 + relish2 + waiterCom2 + cashInReport2;
        
        return {
          day: item["Date"] || `Day ${index + 1}`,
          revenue: totalRevenue,
          netIncome: netIncome,
          date: item["Date"] || `2024-${String(index + 1).padStart(2, '0')}-01`,
          details: {
            cashInReport,
            card,
            dd,
            ue,
            gh,
            cn,
            catering,
            otherCash,
            foodja,
            zelle,
            ezCater,
            relish,
            waiterCom,
            total: totalRevenue
          },
          netIncomeDetails: {
            card2,
            dd2,
            ue2,
            gh2,
            catering2,
            otherCash2,
            foodja2,
            ezCater2,
            relish2,
            waiterCom2,
            cashInReport2,
            total: netIncome
          }
        };
      });
      
      const totalRev = chartData.reduce((sum, item) => sum + item.revenue, 0);
      const totalNet = chartData.reduce((sum, item) => sum + item.netIncome, 0);
      
      setData(chartData);
      setTotalRevenue(totalRev);
      setTotalNetIncome(totalNet);
      setLoading(false);
    }
    loadData();
  }, [timePeriod]);

  const handleDateClick = (date: string) => {
    const dateData = data.find(item => item.day === date);
    if (dateData) {
      setSelectedDate(date);
      setSelectedDateDetails(dateData);
    }
  };

  const closeDateDetails = () => {
    setSelectedDate(null);
    setSelectedDateDetails(null);
  };

  if (loading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <span className="text-sm text-gray-500">Loading revenue data...</span>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          <p className="text-green-600">
            Revenue: <span className="font-bold">${payload[0].value.toLocaleString()}</span>
          </p>
          <p className="text-blue-600">
            Net Income: <span className="font-bold">${payload[1].value.toLocaleString()}</span>
          </p>
          <button 
            onClick={() => handleDateClick(label)}
            className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
          >
            Click for details
          </button>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Revenue Analytics</h3>
          <p className="text-gray-600 mt-1">
            {timePeriod === 'month' ? 'Monthly' : timePeriod === 'quarter' ? 'Quarterly' : 'Yearly'} revenue trends
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">
            {timePeriod === 'month' ? 'Month' : timePeriod === 'quarter' ? 'Quarter' : 'Year'} Total
          </div>
          <div className="text-2xl font-bold text-green-600">${totalRevenue.toLocaleString()}</div>
        </div>
      </div>

      {/* Time Period Navigation */}
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-gray-700">View:</span>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setTimePeriod('month')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              timePeriod === 'month'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setTimePeriod('quarter')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              timePeriod === 'quarter'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Quarter
          </button>
          <button
            onClick={() => setTimePeriod('year')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              timePeriod === 'year'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Year
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-green-600">💰</span>
            <span className="text-sm font-medium text-green-800">
              {timePeriod === 'month' ? 'Month' : timePeriod === 'quarter' ? 'Quarter' : 'Year'} Revenue
            </span>
          </div>
          <div className="text-xl font-bold text-green-900">${totalRevenue.toLocaleString()}</div>
          <div className="text-xs text-green-700 mt-1">
            {timePeriod === 'month' ? 'Current month' : timePeriod === 'quarter' ? 'Current quarter' : 'Current year'}
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-blue-600">📈</span>
            <span className="text-sm font-medium text-blue-800">Net Income</span>
          </div>
          <div className="text-xl font-bold text-blue-900">${totalNetIncome.toLocaleString()}</div>
          <div className="text-xs text-blue-700 mt-1">
            {timePeriod === 'month' ? 'Current month' : timePeriod === 'quarter' ? 'Current quarter' : 'Current year'}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-gray-50 rounded-xl p-4">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="netIncomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="day" 
              stroke="#6B7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#6B7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#10B981" 
              strokeWidth={3}
              fill="url(#revenueGradient)"
              name="Daily Revenue"
            />
            <Area 
              type="monotone" 
              dataKey="netIncome" 
              stroke="#3B82F6" 
              strokeWidth={3}
              fill="url(#netIncomeGradient)"
              name="Net Income"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Date Details Modal */}
      {selectedDate && selectedDateDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Revenue Breakdown - {selectedDate}
              </h3>
              <button
                onClick={closeDateDetails}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">Total Revenue</h4>
                <p className="text-2xl font-bold text-green-600">
                  ${selectedDateDetails.details.total.toLocaleString()}
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Net Income</h4>
                <p className="text-2xl font-bold text-blue-600">
                  ${selectedDateDetails.netIncomeDetails.total.toLocaleString()}
                </p>
                <p className="text-xs text-blue-700 mt-1">*Includes Sales Tax (needs deduction)</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Revenue Sources:</h4>
                <div className="space-y-3">
                  {Object.entries(selectedDateDetails.details).map(([key, value]) => {
                    if (key === 'total') return null;
                    const displayName = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                    return (
                      <div key={key} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-700">{displayName}</span>
                        <span className="font-bold text-green-600">${(value as number).toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Net Income Sources:</h4>
                <div className="space-y-3">
                  {Object.entries(selectedDateDetails.netIncomeDetails).map(([key, value]) => {
                    if (key === 'total') return null;
                    const displayName = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                    return (
                      <div key={key} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-700">{displayName}</span>
                        <span className="font-bold text-blue-600">${(value as number).toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Help Text */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <span className="text-yellow-600 text-xl">⚠️</span>
          <div>
            <h4 className="font-semibold text-yellow-900 mb-1">Important Note</h4>
            <p className="text-sm text-yellow-800">
              <strong>Net Income includes Sales Tax</strong> that needs to be deducted for accurate profit calculation. 
              The Net Income calculation uses Card2, DD2, UE2, GH2, Catering, Other Cash, Foodja2, EzCater2, Relish2, waiter.com2, and Cash in Report columns.
            </p>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-blue-50 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <span className="text-blue-600 text-xl">💡</span>
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">Revenue Insights</h4>
            <p className="text-sm text-blue-800">
              Revenue includes: Cash, Cards, Delivery platforms (DD, UE, GH, CN), Catering, Other Cash, Foodja, Zelle, EzCater, Relish, and waiter.com. 
              {data.length > 0 ? ` Showing ${data.length} days of data.` : ' No data available for current period.'}
              Click on any date point to see detailed breakdown.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}