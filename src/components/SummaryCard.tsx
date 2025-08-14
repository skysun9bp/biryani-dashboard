
// File: /src/components/SummaryCard.tsx
import React, { useEffect, useState } from "react";
import { fetchSheetData } from "../utils/fetchSheet";

export function SummaryCard() {
  const [revenue, setRevenue] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [salaries, setSalaries] = useState(0);
  const [netProfit, setNetProfit] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [comparisonMode, setComparisonMode] = useState<'current' | 'yoy' | 'qoq'>('current');
  const [comparisonData, setComparisonData] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      const revenueData = await fetchSheetData("Net Sale");
      const expenseData = await fetchSheetData("Expenses");
      const salaryData = await fetchSheetData("Salaries");
      
      // Get current date and calculate time periods
      const currentDate = new Date();
      const currentMonth = currentDate.toLocaleString('default', { month: 'short' });
      const currentYear = currentDate.getFullYear().toString();
      const currentQuarter = Math.ceil((currentDate.getMonth() + 1) / 3);
      
      // Filter data based on comparison mode
      let filteredRevenueData = [];
      let filteredExpenseData = [];
      let filteredSalaryData = [];
      let comparisonPeriodData = { revenue: [], expenses: [], salaries: [] };
      
      if (comparisonMode === 'current') {
        // Current month data
        filteredRevenueData = revenueData.filter(row => {
          const rowMonth = row["Month"] || "";
          const rowYear = row["Year"] || "";
          return rowMonth === currentMonth && rowYear === currentYear;
        });
        
        filteredExpenseData = expenseData.filter(row => {
          const rowMonth = row["Month"] || "";
          const rowYear = row["Year"] || "";
          return rowMonth === currentMonth && rowYear === currentYear;
        });
        
        filteredSalaryData = salaryData.filter(row => {
          const rowMonth = row["Month"] || "";
          const rowYear = row["Year"] || "";
          return rowMonth === currentMonth && rowYear === currentYear;
        });
      } else if (comparisonMode === 'yoy') {
        // Current month vs same month last year
        const lastYear = (parseInt(currentYear) - 1).toString();
        
        filteredRevenueData = revenueData.filter(row => {
          const rowMonth = row["Month"] || "";
          const rowYear = row["Year"] || "";
          return rowMonth === currentMonth && rowYear === currentYear;
        });
        
        filteredExpenseData = expenseData.filter(row => {
          const rowMonth = row["Month"] || "";
          const rowYear = row["Year"] || "";
          return rowMonth === currentMonth && rowYear === currentYear;
        });
        
        filteredSalaryData = salaryData.filter(row => {
          const rowMonth = row["Month"] || "";
          const rowYear = row["Year"] || "";
          return rowMonth === currentMonth && rowYear === currentYear;
        });
        
        // Comparison period data
        comparisonPeriodData.revenue = revenueData.filter(row => {
          const rowMonth = row["Month"] || "";
          const rowYear = row["Year"] || "";
          return rowMonth === currentMonth && rowYear === lastYear;
        });
        
        comparisonPeriodData.expenses = expenseData.filter(row => {
          const rowMonth = row["Month"] || "";
          const rowYear = row["Year"] || "";
          return rowMonth === currentMonth && rowYear === lastYear;
        });
        
        comparisonPeriodData.salaries = salaryData.filter(row => {
          const rowMonth = row["Month"] || "";
          const rowYear = row["Year"] || "";
          return rowMonth === currentMonth && rowYear === lastYear;
        });
      } else if (comparisonMode === 'qoq') {
        // Current quarter vs previous quarter
        const previousQuarter = currentQuarter === 1 ? 4 : currentQuarter - 1;
        const previousQuarterYear = currentQuarter === 1 ? (parseInt(currentYear) - 1).toString() : currentYear;
        
        filteredRevenueData = revenueData.filter(row => {
          const rowYear = row["Year"] || "";
          if (rowYear !== currentYear) return false;
          const rowMonth = row["Month"] || "";
          const monthNum = new Date(`2024 ${rowMonth} 1`).getMonth() + 1;
          const rowQuarter = Math.ceil(monthNum / 3);
          return rowQuarter === currentQuarter;
        });
        
        filteredExpenseData = expenseData.filter(row => {
          const rowYear = row["Year"] || "";
          if (rowYear !== currentYear) return false;
          const rowMonth = row["Month"] || "";
          const monthNum = new Date(`2024 ${rowMonth} 1`).getMonth() + 1;
          const rowQuarter = Math.ceil(monthNum / 3);
          return rowQuarter === currentQuarter;
        });
        
        filteredSalaryData = salaryData.filter(row => {
          const rowYear = row["Year"] || "";
          if (rowYear !== currentYear) return false;
          const rowMonth = row["Month"] || "";
          const monthNum = new Date(`2024 ${rowMonth} 1`).getMonth() + 1;
          const rowQuarter = Math.ceil(monthNum / 3);
          return rowQuarter === currentQuarter;
        });
        
        // Comparison period data
        comparisonPeriodData.revenue = revenueData.filter(row => {
          const rowYear = row["Year"] || "";
          if (rowYear !== previousQuarterYear) return false;
          const rowMonth = row["Month"] || "";
          const monthNum = new Date(`2024 ${rowMonth} 1`).getMonth() + 1;
          const rowQuarter = Math.ceil(monthNum / 3);
          return rowQuarter === previousQuarter;
        });
        
        comparisonPeriodData.expenses = expenseData.filter(row => {
          const rowYear = row["Year"] || "";
          if (rowYear !== previousQuarterYear) return false;
          const rowMonth = row["Month"] || "";
          const monthNum = new Date(`2024 ${rowMonth} 1`).getMonth() + 1;
          const rowQuarter = Math.ceil(monthNum / 3);
          return rowQuarter === previousQuarter;
        });
        
        comparisonPeriodData.salaries = salaryData.filter(row => {
          const rowYear = row["Year"] || "";
          if (rowYear !== previousQuarterYear) return false;
          const rowMonth = row["Month"] || "";
          const monthNum = new Date(`2024 ${rowMonth} 1`).getMonth() + 1;
          const rowQuarter = Math.ceil(monthNum / 3);
          return rowQuarter === previousQuarter;
        });
      }
      
      // Calculate revenue - only specific columns
      const totalRevenue = filteredRevenueData.reduce((sum, item) => {
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
        
        return sum + cashInReport + card + dd + ue + gh + cn + catering + otherCash + foodja + zelle + ezCater + relish + waiterCom;
      }, 0);
      
      // Calculate expenses
      const totalExpenses = filteredExpenseData.reduce((sum, item) => {
        return sum + parseFloat(item["Amount"] || "0");
      }, 0);
      
      // Calculate salaries
      const totalSalaries = filteredSalaryData.reduce((sum, item) => {
        return sum + parseFloat(item["Amount"] || "0");
      }, 0);
      
      // Calculate net profit
      const totalNetProfit = totalRevenue - totalExpenses - totalSalaries;
      
      // Calculate comparison data
      let comparisonBreakdown = null;
      if (comparisonPeriodData.revenue.length > 0 || comparisonPeriodData.expenses.length > 0 || comparisonPeriodData.salaries.length > 0) {
        const comparisonRevenue = comparisonPeriodData.revenue.reduce((sum, item) => {
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
          
          return sum + cashInReport + card + dd + ue + gh + cn + catering + otherCash + foodja + zelle + ezCater + relish + waiterCom;
        }, 0);
        
        const comparisonExpenses = comparisonPeriodData.expenses.reduce((sum, item) => {
          return sum + parseFloat(item["Amount"] || "0");
        }, 0);
        
        const comparisonSalaries = comparisonPeriodData.salaries.reduce((sum, item) => {
          return sum + parseFloat(item["Amount"] || "0");
        }, 0);
        
        const comparisonNetProfit = comparisonRevenue - comparisonExpenses - comparisonSalaries;
        
        comparisonBreakdown = {
          revenue: comparisonRevenue,
          expenses: comparisonExpenses,
          salaries: comparisonSalaries,
          netProfit: comparisonNetProfit
        };
      }
      
      setRevenue(totalRevenue);
      setExpenses(totalExpenses);
      setSalaries(totalSalaries);
      setNetProfit(totalNetProfit);
      setComparisonData(comparisonBreakdown);
      setLastUpdated(new Date());
    }
    loadData();
  }, [comparisonMode]);

  const getComparisonText = () => {
    if (comparisonMode === 'yoy') return 'Year over Year';
    if (comparisonMode === 'qoq') return 'Quarter over Quarter';
    return 'Current Period';
  };

  const getComparisonChange = (current: number, previous: number) => {
    if (previous === 0) return null;
    const change = ((current - previous) / previous) * 100;
    return {
      change,
      isPositive: change > 0
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue Card */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-200 rounded-lg">
              <span className="text-2xl">💰</span>
            </div>
            <div className="text-right">
              <div className="text-sm text-green-600 font-medium">Revenue</div>
              <div className="text-xs text-green-500">{getComparisonText()}</div>
            </div>
          </div>
          <div className="mb-2">
            <div className="text-2xl font-bold text-green-900">{formatCurrency(revenue)}</div>
            {comparisonData && (
              <div className="flex items-center space-x-2 mt-1">
                {(() => {
                  const comparison = getComparisonChange(revenue, comparisonData.revenue);
                  if (!comparison) return null;
                  return (
                    <>
                      <span className={`text-sm ${comparison.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {comparison.isPositive ? '↗' : '↘'} {Math.abs(comparison.change).toFixed(1)}%
                      </span>
                      <span className="text-xs text-gray-500">
                        vs {comparisonMode === 'yoy' ? 'last year' : 'last quarter'}
                      </span>
                    </>
                  );
                })()}
              </div>
            )}
          </div>
          <div className="text-xs text-green-700">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        </div>

        {/* Expenses Card */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-2xl border border-red-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-red-200 rounded-lg">
              <span className="text-2xl">💸</span>
            </div>
            <div className="text-right">
              <div className="text-sm text-red-600 font-medium">Expenses</div>
              <div className="text-xs text-red-500">{getComparisonText()}</div>
            </div>
          </div>
          <div className="mb-2">
            <div className="text-2xl font-bold text-red-900">{formatCurrency(expenses)}</div>
            {comparisonData && (
              <div className="flex items-center space-x-2 mt-1">
                {(() => {
                  const comparison = getComparisonChange(expenses, comparisonData.expenses);
                  if (!comparison) return null;
                  return (
                    <>
                      <span className={`text-sm ${comparison.isPositive ? 'text-red-600' : 'text-green-600'}`}>
                        {comparison.isPositive ? '↗' : '↘'} {Math.abs(comparison.change).toFixed(1)}%
                      </span>
                      <span className="text-xs text-gray-500">
                        vs {comparisonMode === 'yoy' ? 'last year' : 'last quarter'}
                      </span>
                    </>
                  );
                })()}
              </div>
            )}
          </div>
          <div className="text-xs text-red-700">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        </div>

        {/* Salaries Card */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-200 rounded-lg">
              <span className="text-2xl">👥</span>
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-600 font-medium">Salaries</div>
              <div className="text-xs text-blue-500">{getComparisonText()}</div>
            </div>
          </div>
          <div className="mb-2">
            <div className="text-2xl font-bold text-blue-900">{formatCurrency(salaries)}</div>
            {comparisonData && (
              <div className="flex items-center space-x-2 mt-1">
                {(() => {
                  const comparison = getComparisonChange(salaries, comparisonData.salaries);
                  if (!comparison) return null;
                  return (
                    <>
                      <span className={`text-sm ${comparison.isPositive ? 'text-red-600' : 'text-green-600'}`}>
                        {comparison.isPositive ? '↗' : '↘'} {Math.abs(comparison.change).toFixed(1)}%
                      </span>
                      <span className="text-xs text-gray-500">
                        vs {comparisonMode === 'yoy' ? 'last year' : 'last quarter'}
                      </span>
                    </>
                  );
                })()}
              </div>
            )}
          </div>
          <div className="text-xs text-blue-700">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        </div>

        {/* Net Profit Card */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-200 rounded-lg">
              <span className="text-2xl">📈</span>
            </div>
            <div className="text-right">
              <div className="text-sm text-purple-600 font-medium">Net Profit</div>
              <div className="text-xs text-purple-500">{getComparisonText()}</div>
            </div>
          </div>
          <div className="mb-2">
            <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-purple-900' : 'text-red-600'}`}>
              {formatCurrency(netProfit)}
            </div>
            {comparisonData && (
              <div className="flex items-center space-x-2 mt-1">
                {(() => {
                  const comparison = getComparisonChange(netProfit, comparisonData.netProfit);
                  if (!comparison) return null;
                  return (
                    <>
                      <span className={`text-sm ${comparison.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {comparison.isPositive ? '↗' : '↘'} {Math.abs(comparison.change).toFixed(1)}%
                      </span>
                      <span className="text-xs text-gray-500">
                        vs {comparisonMode === 'yoy' ? 'last year' : 'last quarter'}
                      </span>
                    </>
                  );
                })()}
              </div>
            )}
          </div>
          <div className="text-xs text-purple-700">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Summary Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <span className="text-blue-600 text-xl">📊</span>
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">Financial Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-700">
                  <span className="font-medium">Revenue:</span> {formatCurrency(revenue)}
                </p>
                <p className="text-gray-600 text-xs">
                  {comparisonMode === 'yoy' ? 'Current month vs same month last year' : 
                   comparisonMode === 'qoq' ? 'Current quarter vs previous quarter' : 
                   'Current month total'}
                </p>
              </div>
              <div>
                <p className="text-gray-700">
                  <span className="font-medium">Total Costs:</span> {formatCurrency(expenses + salaries)}
                </p>
                <p className="text-gray-600 text-xs">
                  Expenses + Salaries
                </p>
              </div>
              <div>
                <p className="text-gray-700">
                  <span className="font-medium">Profit Margin:</span> {revenue > 0 ? ((netProfit / revenue) * 100).toFixed(1) : '0'}%
                </p>
                <p className="text-gray-600 text-xs">
                  Net Profit / Revenue
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
