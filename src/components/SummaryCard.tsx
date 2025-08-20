
// File: /src/components/SummaryCard.tsx
import React, { useEffect, useState } from "react";
import { apiService } from "../services/api";
import { DateFilter } from "./DateFilter";

interface SummaryCardProps {
  selectedYear: string;
  selectedMonth: string;
  onYearChange: (year: string) => void;
  onMonthChange: (month: string) => void;
}

export function SummaryCard({ selectedYear, selectedMonth, onYearChange, onMonthChange }: SummaryCardProps) {
  const [revenue, setRevenue] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [salaries, setSalaries] = useState(0);
  const [ccFees, setCCFees] = useState(0);
  const [commissionFees, setCommissionFees] = useState(0);
  const [netProfit, setNetProfit] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const response = await apiService.getFinancialData(selectedYear || undefined, selectedMonth);
        const { financialData, expenseBreakdown, salaryBreakdown, feeBreakdown } = response;

        // Calculate totals from all data when "All Years" or "All Months" is selected
        let totalRevenue = 0;
        let totalExpenses = 0;
        let totalSalaries = 0;
        let totalNetProfit = 0;

        if (selectedYear === '' || selectedMonth === '') {
          // Aggregate all data when "All Years" or "All Months" is selected
          financialData.forEach((item: any) => {
            totalRevenue += item.revenue || 0;
            totalExpenses += item.expenses || 0;
            totalSalaries += item.salaries || 0;
            totalNetProfit += item.netProfit || 0;
          });
        } else {
          // Find specific month/year data
          const currentMonthData = financialData.find((item: any) =>
            item.month === selectedMonth && item.year === parseInt(selectedYear)
          ) || financialData[0];

          if (currentMonthData) {
            totalRevenue = currentMonthData.revenue || 0;
            totalExpenses = currentMonthData.expenses || 0;
            totalSalaries = currentMonthData.salaries || 0;
            totalNetProfit = currentMonthData.netProfit || 0;
          }
        }

        setRevenue(totalRevenue);
        setExpenses(totalExpenses);
        setSalaries(totalSalaries);
        setNetProfit(totalNetProfit);

          // Calculate fees from the new feeBreakdown
          const ccFeesTotal = feeBreakdown
            .filter((item: any) => item.category === 'Credit Card Fees')
            .reduce((sum: number, item: any) => sum + item.amount, 0);
          setCCFees(ccFeesTotal);

          // Calculate commissions as sum of all delivery platform fees
          const commissionTotal = feeBreakdown
            .filter((item: any) => 
              item.category === 'DD Fees' || 
              item.category === 'UE Fees' || 
              item.category === 'GH Fees' || 
              item.category === 'Foodja Fees' || 
              item.category === 'EzCater Fees' || 
              item.category === 'Relish Fees'
            )
            .reduce((sum: number, item: any) => sum + item.amount, 0);
          setCommissionFees(commissionTotal);

        setLoading(false);
        setLastUpdated(new Date().toLocaleString());
      } catch (error) {
        console.error('Error loading financial data:', error);
        setLoading(false);
      }
    }

    loadData();
  }, [selectedYear, selectedMonth]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number, total: number) => {
    if (total === 0) return '0%';
    return `${((value / total) * 100).toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Filter */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Financial Summary</h2>
        <DateFilter
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          onYearChange={onYearChange}
          onMonthChange={onMonthChange}
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Revenue Card */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(revenue)}</p>
            </div>
            <div className="text-green-500">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>

        {/* Expenses Card */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Expenses</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(expenses)}</p>
            </div>
            <div className="text-red-500">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Salaries Card */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Salaries</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(salaries)}</p>
            </div>
            <div className="text-blue-500">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Net Profit Card */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Net Profit</p>
              <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(netProfit)}
              </p>
            </div>
            <div className={netProfit >= 0 ? 'text-green-500' : 'text-red-500'}>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>

        {/* CC Fees Card */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">CC Fees</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(ccFees)}</p>
            </div>
            <div className="text-yellow-500">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Commission Fees Card */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-indigo-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Commission</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(commissionFees)}</p>
            </div>
            <div className="text-indigo-500">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Last Updated */}
      <div className="text-right">
        <p className="text-sm text-gray-500">Last updated: {lastUpdated}</p>
      </div>
    </div>
  );
}