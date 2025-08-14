import React, { useEffect, useState } from "react";
import { fetchSheetData } from "../utils/fetchSheet";

interface ExpenseDetailsProps {
  costType: string;
  onBack: () => void;
}

export function ExpenseDetails({ costType, onBack }: ExpenseDetailsProps) {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalAmount, setTotalAmount] = useState(0);
  const [groupBy, setGroupBy] = useState<'expenseType' | 'vendor' | 'date'>('expenseType');

  useEffect(() => {
    async function loadExpenseDetails() {
      const expenseData = await fetchSheetData("Expenses");
      
      // Get current month and year
      const currentDate = new Date();
      const currentMonth = currentDate.toLocaleString('default', { month: 'short' });
      const currentYear = currentDate.getFullYear().toString();
      
      // Filter expenses for the selected cost type in current month
      const filteredExpenses = expenseData.filter(row => {
        const rowCostType = row["Cost Type"] || "";
        const rowMonth = row["Month"] || "";
        const rowYear = row["Year"] || "";
        return rowCostType === costType && rowMonth === currentMonth && rowYear === currentYear;
      });
      
      setExpenses(filteredExpenses);
      const total = filteredExpenses.reduce((sum, item) => sum + parseFloat(item["Amount"] || "0"), 0);
      setTotalAmount(total);
      setLoading(false);
    }
    
    loadExpenseDetails();
  }, [costType]);

  const groupExpenses = () => {
    const grouped: { [key: string]: any[] } = {};
    
    expenses.forEach(expense => {
      let key = "";
      if (groupBy === 'expenseType') {
        key = expense["Expense Type"] || "Unknown";
      } else if (groupBy === 'vendor') {
        key = expense["Item (Vendor)"] || "Unknown";
      } else if (groupBy === 'date') {
        key = expense["Date"] || "Unknown";
      }
      
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(expense);
    });
    
    return Object.entries(grouped).map(([key, items]) => ({
      name: key,
      items,
      total: items.reduce((sum, item) => sum + parseFloat(item["Amount"] || "0"), 0),
      count: items.length
    })).sort((a, b) => b.total - a.total);
  };

  if (loading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <span className="text-sm text-gray-500">Loading expense details...</span>
        </div>
      </div>
    );
  }

  const groupedExpenses = groupExpenses();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 mb-2"
          >
            <span>←</span>
            <span>Back to Cost Types</span>
          </button>
          <h3 className="text-2xl font-bold text-gray-900">{costType} Expenses</h3>
          <p className="text-gray-600 mt-1">Detailed breakdown for current month</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Total Amount</div>
          <div className="text-2xl font-bold text-red-600">${totalAmount.toLocaleString()}</div>
        </div>
      </div>

      {/* Group By Toggle */}
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-gray-700">Group by:</span>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setGroupBy('expenseType')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              groupBy === 'expenseType'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Expense Type
          </button>
          <button
            onClick={() => setGroupBy('vendor')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              groupBy === 'vendor'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Vendor
          </button>
          <button
            onClick={() => setGroupBy('date')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              groupBy === 'date'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Date
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-red-50 p-4 rounded-xl border border-red-200">
          <div className="text-sm font-medium text-red-800 mb-1">Total Expenses</div>
          <div className="text-xl font-bold text-red-900">${totalAmount.toLocaleString()}</div>
        </div>
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
          <div className="text-sm font-medium text-blue-800 mb-1">Total Items</div>
          <div className="text-xl font-bold text-blue-900">{expenses.length}</div>
        </div>
        <div className="bg-green-50 p-4 rounded-xl border border-green-200">
          <div className="text-sm font-medium text-green-800 mb-1">Categories</div>
          <div className="text-xl font-bold text-green-900">{groupedExpenses.length}</div>
        </div>
      </div>

      {/* Grouped Expenses */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          {groupBy === 'expenseType' ? 'Expense Types' : 
           groupBy === 'vendor' ? 'Vendors' : 'Dates'}
        </h4>
        <div className="space-y-4">
          {groupedExpenses.map((group, index) => (
            <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h5 className="font-semibold text-gray-900">{group.name}</h5>
                    <p className="text-sm text-gray-600">{group.count} items</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-red-600">${group.total.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">
                      {((group.total / totalAmount) * 100).toFixed(1)}% of total
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-2">
                  {group.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {groupBy === 'expenseType' ? item["Item (Vendor)"] : 
                           groupBy === 'vendor' ? item["Expense Type"] : 
                           item["Item (Vendor)"]}
                        </p>
                        <p className="text-sm text-gray-600">
                          {item["Date"]} • {item["Payment Type"] || "Unknown payment"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-red-600">${parseFloat(item["Amount"] || "0").toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <span className="text-blue-600 text-xl">📊</span>
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">Summary</h4>
            <p className="text-sm text-blue-800">
              {costType} expenses total ${totalAmount.toLocaleString()} across {expenses.length} items. 
              The largest {groupBy === 'expenseType' ? 'expense type' : 
                          groupBy === 'vendor' ? 'vendor' : 'date'} is {groupedExpenses[0]?.name} 
              with ${groupedExpenses[0]?.total.toLocaleString()}.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
