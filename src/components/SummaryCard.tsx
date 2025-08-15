
// File: /src/components/SummaryCard.tsx
import React, { useEffect, useState } from "react";
import { fetchSheetData } from "../utils/fetchSheet";
import { DateFilter } from "./DateFilter";

interface SummaryCardProps {}

export function SummaryCard({}: SummaryCardProps) {
  const [revenue, setRevenue] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [salaries, setSalaries] = useState(0);
  const [ccFees, setCCFees] = useState(0);
  const [netProfit, setNetProfit] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState("");
  const [comparisonMode, setComparisonMode] = useState<'current' | 'yoy' | 'qoq'>('current');
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState(new Date().toLocaleString('default', { month: 'short' }));

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

      let filteredRevenueData = [];
      let filteredExpenseData = [];
      let filteredSalaryData = [];
      let comparisonPeriodData = null;

      if (comparisonMode === 'current') {
        // Current month data
        filteredRevenueData = revenueData.filter(row => {
          const rowMonth = row["Month"] || "";
          const rowYear = row["Year"] || "";
          return rowMonth === selectedMonth && rowYear === selectedYear;
        });

        filteredExpenseData = expenseData.filter(row => {
          const rowMonth = row["Month"] || "";
          const rowYear = row["Year"] || "";
          return rowMonth === selectedMonth && rowYear === selectedYear;
        });

        filteredSalaryData = salaryData.filter(row => {
          const rowMonth = row["Month"] || "";
          const rowYear = row["Year"] || "";
          return rowMonth === selectedMonth && rowYear === selectedYear;
        });
      } else if (comparisonMode === 'yoy') {
        // Current month vs same month last year
        const lastYear = (parseInt(selectedYear) - 1).toString();
        
        filteredRevenueData = revenueData.filter(row => {
          const rowMonth = row["Month"] || "";
          const rowYear = row["Year"] || "";
          return rowMonth === selectedMonth && rowYear === selectedYear;
        });

        filteredExpenseData = expenseData.filter(row => {
          const rowMonth = row["Month"] || "";
          const rowYear = row["Year"] || "";
          return rowMonth === selectedMonth && rowYear === selectedYear;
        });

        filteredSalaryData = salaryData.filter(row => {
          const rowMonth = row["Month"] || "";
          const rowYear = row["Year"] || "";
          return rowMonth === selectedMonth && rowYear === selectedYear;
        });

        // Comparison data (same month last year)
        const comparisonRevenueData = revenueData.filter(row => {
          const rowMonth = row["Month"] || "";
          const rowYear = row["Year"] || "";
          return rowMonth === selectedMonth && rowYear === lastYear;
        });

        const comparisonExpenseData = expenseData.filter(row => {
          const rowMonth = row["Month"] || "";
          const rowYear = row["Year"] || "";
          return rowMonth === selectedMonth && rowYear === lastYear;
        });

        const comparisonSalaryData = salaryData.filter(row => {
          const rowMonth = row["Month"] || "";
          const rowYear = row["Year"] || "";
          return rowMonth === selectedMonth && rowYear === lastYear;
        });

        comparisonPeriodData = {
          revenue: calculateRevenue(comparisonRevenueData),
          expenses: calculateExpenses(comparisonExpenseData),
          salaries: calculateSalaries(comparisonSalaryData),
          ccFees: calculateCCFees(comparisonRevenueData)
        };
      } else if (comparisonMode === 'qoq') {
        // Current quarter vs previous quarter
        const previousQuarter = currentQuarter === 1 ? 4 : currentQuarter - 1;
        const previousQuarterYear = currentQuarter === 1 ? (parseInt(selectedYear) - 1).toString() : selectedYear;
        
        filteredRevenueData = revenueData.filter(row => {
          const rowYear = row["Year"] || "";
          if (rowYear !== selectedYear) return false;
          const rowMonth = row["Month"] || "";
          const monthNum = new Date(`2024 ${rowMonth} 1`).getMonth() + 1;
          const rowQuarter = Math.ceil(monthNum / 3);
          return rowQuarter === currentQuarter;
        });

        filteredExpenseData = expenseData.filter(row => {
          const rowYear = row["Year"] || "";
          if (rowYear !== selectedYear) return false;
          const rowMonth = row["Month"] || "";
          const monthNum = new Date(`2024 ${rowMonth} 1`).getMonth() + 1;
          const rowQuarter = Math.ceil(monthNum / 3);
          return rowQuarter === currentQuarter;
        });

        filteredSalaryData = salaryData.filter(row => {
          const rowYear = row["Year"] || "";
          if (rowYear !== selectedYear) return false;
          const rowMonth = row["Month"] || "";
          const monthNum = new Date(`2024 ${rowMonth} 1`).getMonth() + 1;
          const rowQuarter = Math.ceil(monthNum / 3);
          return rowQuarter === currentQuarter;
        });

        // Comparison data (previous quarter)
        const comparisonRevenueData = revenueData.filter(row => {
          const rowYear = row["Year"] || "";
          if (rowYear !== previousQuarterYear) return false;
          const rowMonth = row["Month"] || "";
          const monthNum = new Date(`2024 ${rowMonth} 1`).getMonth() + 1;
          const rowQuarter = Math.ceil(monthNum / 3);
          return rowQuarter === previousQuarter;
        });

        const comparisonExpenseData = expenseData.filter(row => {
          const rowYear = row["Year"] || "";
          if (rowYear !== previousQuarterYear) return false;
          const rowMonth = row["Month"] || "";
          const monthNum = new Date(`2024 ${rowMonth} 1`).getMonth() + 1;
          const rowQuarter = Math.ceil(monthNum / 3);
          return rowQuarter === previousQuarter;
        });

        const comparisonSalaryData = salaryData.filter(row => {
          const rowYear = row["Year"] || "";
          if (rowYear !== previousQuarterYear) return false;
          const rowMonth = row["Month"] || "";
          const monthNum = new Date(`2024 ${rowMonth} 1`).getMonth() + 1;
          const rowQuarter = Math.ceil(monthNum / 3);
          return rowQuarter === previousQuarter;
        });

        comparisonPeriodData = {
          revenue: calculateRevenue(comparisonRevenueData),
          expenses: calculateExpenses(comparisonExpenseData),
          salaries: calculateSalaries(comparisonSalaryData),
          ccFees: calculateCCFees(comparisonRevenueData)
        };
      }

      const revenueTotal = calculateRevenue(filteredRevenueData);
      const expensesTotal = calculateExpenses(filteredExpenseData);
      const salariesTotal = calculateSalaries(filteredSalaryData);
      const ccFeesTotal = calculateCCFees(filteredRevenueData);
      const netProfitTotal = revenueTotal - expensesTotal - salariesTotal - ccFeesTotal;

      setRevenue(revenueTotal);
      setExpenses(expensesTotal);
      setSalaries(salariesTotal);
      setCCFees(ccFeesTotal);
      setNetProfit(netProfitTotal);
      setComparisonData(comparisonPeriodData);
      setLastUpdated(new Date().toLocaleTimeString());
      setLoading(false);
    }

    loadData();
  }, [comparisonMode, selectedYear, selectedMonth]);

  const calculateRevenue = (data: any[]) => {
    return Math.round(data.reduce((sum, item) => {
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
    }, 0));
  };

  const calculateExpenses = (data: any[]) => {
    return Math.round(data.reduce((sum, item) => {
      return sum + parseFloat(item["Amount"] || "0");
    }, 0));
  };

  const calculateSalaries = (data: any[]) => {
    return Math.round(data.reduce((sum, item) => {
      return sum + parseFloat(item["Amount"] || "0");
    }, 0));
  };

  const calculateCCFees = (revenueData: any[]) => {
    return Math.round(revenueData.reduce((sum, item) => {
      return sum + parseFloat(item["CC Fees"] || "0");
    }, 0));
  };

  const getComparisonText = () => {
    if (comparisonMode === 'yoy') return 'Year over Year';
    if (comparisonMode === 'qoq') return 'Quarter over Quarter';
    return 'Current Period';
  };

  const getComparisonChange = (current: number, previous: number) => {
    if (previous === 0) return null;
    const change = ((current - previous) / previous) * 100;
    return {
      change: Math.round(change),
      isPositive: change > 0
    };
  };

  const totalCosts = expenses + salaries + ccFees;
  const profitMargin = revenue > 0 ? Math.round((netProfit / revenue) * 100) : 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
          <div className="flex items-center space-x-3 mb-3">
            <span className="text-green-600 text-2xl">💰</span>
            <div>
              <h3 className="text-lg font-semibold text-green-900">Revenue {getComparisonText()}</h3>
              <p className="text-sm text-green-700">Last updated: {lastUpdated}</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-green-900 mb-2">${revenue.toLocaleString()}</div>
          {comparisonData && (
            <div className="text-sm">
              {(() => {
                const change = getComparisonChange(revenue, comparisonData.revenue);
                if (change) {
                  return (
                    <span className={`${change.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {change.isPositive ? '↗' : '↘'} {Math.abs(change.change)}% vs previous
                    </span>
                  );
                }
                return null;
              })()}
            </div>
          )}
        </div>

        <div className="bg-gradient-to-r from-red-50 to-red-100 p-6 rounded-xl border border-red-200">
          <div className="flex items-center space-x-3 mb-3">
            <span className="text-red-600 text-2xl">💸</span>
            <div>
              <h3 className="text-lg font-semibold text-red-900">Expenses {getComparisonText()}</h3>
              <p className="text-sm text-red-700">Last updated: {lastUpdated}</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-red-900 mb-2">${expenses.toLocaleString()}</div>
          {comparisonData && (
            <div className="text-sm">
              {(() => {
                const change = getComparisonChange(expenses, comparisonData.expenses);
                if (change) {
                  return (
                    <span className={`${change.isPositive ? 'text-red-600' : 'text-green-600'}`}>
                      {change.isPositive ? '↗' : '↘'} {Math.abs(change.change)}% vs previous
                    </span>
                  );
                }
                return null;
              })()}
            </div>
          )}
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
          <div className="flex items-center space-x-3 mb-3">
            <span className="text-blue-600 text-2xl">👥</span>
            <div>
              <h3 className="text-lg font-semibold text-blue-900">Salaries {getComparisonText()}</h3>
              <p className="text-sm text-blue-700">Last updated: {lastUpdated}</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-blue-900 mb-2">${salaries.toLocaleString()}</div>
          {comparisonData && (
            <div className="text-sm">
              {(() => {
                const change = getComparisonChange(salaries, comparisonData.salaries);
                if (change) {
                  return (
                    <span className={`${change.isPositive ? 'text-red-600' : 'text-green-600'}`}>
                      {change.isPositive ? '↗' : '↘'} {Math.abs(change.change)}% vs previous
                    </span>
                  );
                }
                return null;
              })()}
            </div>
          )}
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
          <div className="flex items-center space-x-3 mb-3">
            <span className="text-purple-600 text-2xl">📈</span>
            <div>
              <h3 className="text-lg font-semibold text-purple-900">Net Profit {getComparisonText()}</h3>
              <p className="text-sm text-purple-700">Last updated: {lastUpdated}</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-purple-900 mb-2">${netProfit.toLocaleString()}</div>
          {comparisonData && (
            <div className="text-sm">
              {(() => {
                const previousNetProfit = comparisonData.revenue - comparisonData.expenses - comparisonData.salaries - (comparisonData.ccFees || 0);
                const change = getComparisonChange(netProfit, previousNetProfit);
                if (change) {
                  return (
                    <span className={`${change.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {change.isPositive ? '↗' : '↘'} {Math.abs(change.change)}% vs previous
                    </span>
                  );
                }
                return null;
              })()}
            </div>
          )}
        </div>
      </div>

      {/* Financial Summary */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-xl border border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <span className="text-blue-600 text-xl">📊</span>
          <h3 className="text-xl font-semibold text-gray-900">Financial Summary</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <div className="text-2xl font-bold text-green-600">${revenue.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Revenue</div>
            <div className="text-xs text-gray-500">Current {comparisonMode === 'qoq' ? 'quarter' : 'month'} total</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">${totalCosts.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Costs</div>
            <div className="text-xs text-gray-500">Expenses + Salaries + CC Fees</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">${ccFees.toLocaleString()}</div>
            <div className="text-sm text-gray-600">CC Fees</div>
            <div className="text-xs text-gray-500">Credit card processing fees</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">{profitMargin}%</div>
            <div className="text-sm text-gray-600">Profit Margin</div>
            <div className="text-xs text-gray-500">Net Profit / Revenue</div>
          </div>
        </div>
      </div>
    </div>
  );
}