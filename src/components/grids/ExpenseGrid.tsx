import React, { useState, useEffect } from 'react';
import { apiService, ExpenseEntry } from '../../services/api';

interface ExpenseGridProps {
  year: number;
  month: string;
}

interface EditableExpenseEntry extends ExpenseEntry {
  isEditing?: boolean;
  isNew?: boolean;
}

export default function ExpenseGrid({ year, month }: ExpenseGridProps) {
  const [data, setData] = useState<EditableExpenseEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [costTypes, setCostTypes] = useState<string[]>([]);
  const [totals, setTotals] = useState({
    totalAmount: 0,
    byCostType: {} as Record<string, number>
  });

  useEffect(() => {
    loadData();
    loadCostTypes();
  }, [year, month]);

  useEffect(() => {
    calculateTotals();
  }, [data]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getFinancialData(year, month);
      const expenseData = response.expenseBreakdown || [];
      
      // Convert to editable format - we'll need to get individual entries
      // For now, let's create a mock structure
      const editableData: EditableExpenseEntry[] = [];
      
      // This is a simplified version - in a real implementation, you'd fetch individual expense entries
      expenseData.forEach((item: any) => {
        for (let i = 0; i < Math.ceil(item.amount / 1000); i++) { // Mock multiple entries
          editableData.push({
            id: `mock-${item.category}-${i}`,
            date: new Date(year, getMonthIndex(month), i + 1).toISOString().split('T')[0],
            month: month,
            year: year,
            costType: item.category,
            expenseType: 'General',
            itemVendor: 'Vendor',
            amount: Math.min(1000, item.amount - (i * 1000)),
            isEditing: false,
            isNew: false
          });
        }
      });
      
      setData(editableData);
    } catch (error) {
      console.error('Error loading expense data:', error);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCostTypes = async () => {
    try {
      const types = await apiService.getCostTypes();
      setCostTypes(types);
    } catch (error) {
      console.error('Error loading cost types:', error);
      setCostTypes(['Food costs', 'Rent', 'Utilities', 'Marketing', 'Maintenance', 'Insurance', 'Automobile', 'Sales Tax & CPA', 'Payroll Other taxes', 'LLC Fees', 'Bank Fees', 'Travel', 'Equipment', 'Misc']);
    }
  };

  const getMonthIndex = (month: string): number => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.indexOf(month);
  };

  const calculateTotals = () => {
    const newTotals = {
      totalAmount: 0,
      byCostType: {} as Record<string, number>
    };

    data.forEach(row => {
      newTotals.totalAmount += row.amount || 0;
      const costType = row.costType || 'Unknown';
      newTotals.byCostType[costType] = (newTotals.byCostType[costType] || 0) + (row.amount || 0);
    });

    setTotals(newTotals);
  };

  const handleCellEdit = (rowIndex: number, field: keyof ExpenseEntry, value: any) => {
    const newData = [...data];
    newData[rowIndex] = { ...newData[rowIndex], [field]: value };
    setData(newData);
  };

  const addNewRow = () => {
    const newRow: EditableExpenseEntry = {
      date: new Date().toISOString().split('T')[0],
      month: month,
      year: year,
      costType: costTypes[0] || 'Food costs',
      expenseType: 'General',
      itemVendor: '',
      amount: 0,
      isNew: true,
      isEditing: true
    };
    setData([...data, newRow]);
  };

  const deleteRow = (index: number) => {
    const newData = data.filter((_, i) => i !== index);
    setData(newData);
  };

  const saveRow = async (row: EditableExpenseEntry, index: number) => {
    try {
      if (row.isNew) {
        const result = await apiService.createExpenseEntry(row);
        const newData = [...data];
        newData[index] = { ...result.entry, isEditing: false, isNew: false };
        setData(newData);
      } else {
        const result = await apiService.updateExpenseEntry(row.id!, row);
        const newData = [...data];
        newData[index] = { ...result.entry, isEditing: false, isNew: false };
        setData(newData);
      }
    } catch (error) {
      console.error('Error saving row:', error);
    }
  };

  const columns = [
    { key: 'date', label: 'Date', type: 'date', width: '120px' },
    { key: 'costType', label: 'Cost Type', type: 'select', width: '150px', options: costTypes },
    { key: 'expenseType', label: 'Expense Type', type: 'text', width: '150px' },
    { key: 'itemVendor', label: 'Item/Vendor', type: 'text', width: '200px' },
    { key: 'amount', label: 'Amount', type: 'number', width: '120px' }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Expense Data - {month} {year}</h2>
          <button
            onClick={addNewRow}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Row
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  style={{ width: column.width }}
                >
                  {column.label}
                </th>
              ))}
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, index) => (
              <tr key={index} className={row.isNew ? 'bg-red-50' : ''}>
                {columns.map((column) => (
                  <td key={column.key} className="px-3 py-2 whitespace-nowrap">
                    {row.isEditing ? (
                      column.type === 'select' ? (
                        <select
                          value={row[column.key as keyof ExpenseEntry] || ''}
                          onChange={(e) => handleCellEdit(index, column.key as keyof ExpenseEntry, e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          {column.options?.map((option: string) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={column.type}
                          value={row[column.key as keyof ExpenseEntry] || ''}
                          onChange={(e) => handleCellEdit(index, column.key as keyof ExpenseEntry, 
                            column.type === 'number' ? Number(e.target.value) : e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      )
                    ) : (
                      <span className="text-sm text-gray-900">
                        {column.type === 'number' 
                          ? `$${(row[column.key as keyof ExpenseEntry] || 0).toLocaleString()}`
                          : row[column.key as keyof ExpenseEntry]
                        }
                      </span>
                    )}
                  </td>
                ))}
                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    {row.isEditing ? (
                      <button
                        onClick={() => saveRow(row, index)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Save
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          const newData = [...data];
                          newData[index] = { ...newData[index], isEditing: true };
                          setData(newData);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                    )}
                    <button
                      onClick={() => deleteRow(index)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          
          {/* Totals Row */}
          <tfoot className="bg-gray-50">
            <tr>
              <td colSpan={4} className="px-3 py-3 text-sm font-semibold text-gray-900">TOTAL EXPENSES</td>
              <td className="px-3 py-3 text-sm font-semibold text-gray-900">${totals.totalAmount.toLocaleString()}</td>
              <td className="px-3 py-3"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Cost Type Breakdown */}
      <div className="px-6 py-4 border-t border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Expense Breakdown by Cost Type</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Object.entries(totals.byCostType).map(([costType, amount]) => (
            <div key={costType} className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm font-medium text-gray-900">{costType}</div>
              <div className="text-lg font-semibold text-red-600">${amount.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
