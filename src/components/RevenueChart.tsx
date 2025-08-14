import React, { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { fetchSheetData } from "../utils/fetchSheet";
import { DateFilter } from "./DateFilter";

const COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

export function RevenueChart() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [netIncome, setNetIncome] = useState(0);
  const [comparisonMode, setComparisonMode] = useState<'current' | 'yoy' | 'qoq'>('current');
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [timePeriod, setTimePeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedDateDetails, setSelectedDateDetails] = useState<any>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState(new Date().toLocaleString('default', { month: 'short' }));

  useEffect(() => {
    async function loadData() {
      const revenueData = await fetchSheetData("Net Sale");
      
      // Filter data based on selected year and month
      let filteredData = revenueData.filter(row => {
        const rowYear = row["Year"] || "";
        const rowMonth = row["Month"] || "";
        
        if (selectedMonth) {
          return rowYear === selectedYear && rowMonth === selectedMonth;
        } else {
          return rowYear === selectedYear;
        }
      });

      // Process data for charts
      const processedData = filteredData.map(item => {
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
        
        const totalRev = cashInReport + card + dd + ue + gh + cn + catering + otherCash + foodja + zelle + ezCater + relish + waiterCom;

        // Net Income calculation
        const card2 = parseFloat(item["Card2"] || "0");
        const dd2 = parseFloat(item["DD2"] || "0");
        const ue2 = parseFloat(item["UE2"] || "0");
        const gh2 = parseFloat(item["GH2"] || "0");
        const catering2 = parseFloat(item["Catering"] || "0");
        const otherCash2 = parseFloat(item["Other Cash"] || "0");
        const foodja2 = parseFloat(item["Foodja2"] || "0");
        const ezCater2 = parseFloat(item["EzCater2"] || "0");
        const relish2 = parseFloat(item["Relish2"] || "0");
        const waiterCom2 = parseFloat(item["waiter.com2"] || "0");
        const cashInReport2 = parseFloat(item["Cash in Report"] || "0");

        const netInc = card2 + dd2 + ue2 + gh2 + catering2 + otherCash2 + foodja2 + ezCater2 + relish2 + waiterCom2 + cashInReport2;

        return {
          date: item["Column 1"] || "Unknown Date",
          revenue: totalRev,
          netIncome: netInc,
          details: {
            "Cash in Report": cashInReport,
            "Card": card,
            "DD": dd,
            "UE": ue,
            "GH": gh,
            "CN": cn,
            "Catering": catering,
            "Other Cash": otherCash,
            "Foodja": foodja,
            "Zelle": zelle,
            "Ez Cater": ezCater,
            "Relish": relish,
            "waiter.com": waiterCom
          },
          netIncomeDetails: {
            "Card2": card2,
            "DD2": dd2,
            "UE2": ue2,
            "GH2": gh2,
            "Catering": catering2,
            "Other Cash": otherCash2,
            "Foodja2": foodja2,
            "EzCater2": ezCater2,
            "Relish2": relish2,
            "waiter.com2": waiterCom2,
            "Cash in Report": cashInReport2
          }
        };
      });

      const totalRev = processedData.reduce((sum, item) => sum + item.revenue, 0);
      const totalNetInc = processedData.reduce((sum, item) => sum + item.netIncome, 0);

      setData(processedData);
      setTotalRevenue(totalRev);
      setNetIncome(totalNetInc);
      setLoading(false);
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
            <span className="text-purple-600">📊</span>
            <span className="text-sm font-medium text-purple-800">Net Income</span>
          </div>
          <div className="text-xl font-bold text-purple-900">${netIncome.toLocaleString()}</div>
          <div className="text-xs text-purple-700 mt-1">
            {selectedMonth ? `${selectedMonth} ${selectedYear}` : `${selectedYear} total`}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-gray-50 rounded-xl p-4">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 text-center">
          Revenue vs Net Income - {selectedMonth ? `${selectedMonth} ${selectedYear}` : `${selectedYear}`}
        </h4>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="date" 
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
              stackId="2"
              stroke="#8B5CF6" 
              fill="#8B5CF6" 
              fillOpacity={0.6}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Date Details Modal */}
      {selectedDateDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Revenue Details - {selectedDate}</h3>
              <button
                onClick={() => setSelectedDateDetails(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-green-600 mb-2">Total Revenue: ${selectedDateDetails.revenue.toLocaleString()}</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(selectedDateDetails.details).map(([key, value]: [string, any]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-gray-600">{key}:</span>
                      <span className="font-medium">${value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-purple-600 mb-2">Net Income: ${selectedDateDetails.netIncome.toLocaleString()}</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(selectedDateDetails.netIncomeDetails).map(([key, value]: [string, any]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-gray-600">{key}:</span>
                      <span className="font-medium">${value.toLocaleString()}</span>
                    </div>
                  ))}
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
    </div>
  );
}