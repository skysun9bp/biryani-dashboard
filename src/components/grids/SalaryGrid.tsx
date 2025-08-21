import React, { useState, useEffect } from 'react';
import { apiService, SalaryEntry } from '../../services/api';

interface SalaryGridProps {
  year: string;
  month: string;
}

interface EditableSalaryEntry extends SalaryEntry {
  isEditing?: boolean;
  isNew?: boolean;
}

export default function SalaryGrid({ year, month }: SalaryGridProps) {
  const [data, setData] = useState<EditableSalaryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [resourceNames, setResourceNames] = useState<string[]>([]);
  const [totals, setTotals] = useState({
    totalAmount: 0,
    byEmployee: {} as Record<string, number>
  });

  useEffect(() => {
    loadData();
    loadResourceNames();
  }, [year, month]);

  useEffect(() => {
    calculateTotals();
  }, [data]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      console.log('Loading salary data for:', year, month);
      
      // Fetch actual salary entries from the database
      const response = await apiService.getSalaryEntries({ 
        year: year ? parseInt(year) : undefined, 
        month 
      });
      console.log('Salary API response:', response);
      
      const salaryEntries = response?.entries || [];
      console.log('Salary entries found:', salaryEntries.length);
      
      // Convert to editable format
      const editableData: EditableSalaryEntry[] = salaryEntries.map((item: any) => {
        console.log('Processing salary item:', item);
        return {
          id: item.id,
          date: item.date ? new Date(item.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          month: month,
          year: year ? parseInt(year) : new Date().getFullYear(),
          resourceName: item.resourceName || 'Employee',
          amount: item.amount || 0,
          actualPaidDate: item.actualPaidDate ? new Date(item.actualPaidDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          isEditing: false,
          isNew: false
        };
      });
      
      console.log('Processed salary data:', editableData);
      setData(editableData);
    } catch (error) {
      console.error('Error loading salary data:', error);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadResourceNames = async () => {
    try {
      const names = await apiService.getResourceNames();
      setResourceNames(names);
    } catch (error) {
      console.error('Error loading resource names:', error);
      setResourceNames(['Shan', 'Prakash', 'Dora', 'Mahi', 'Nitya', 'Raj Uncle', 'Susan', 'Shailendar', 'Sarabhjeet', 'Vijaya', 'Saanvi', 'Jose', 'Sai', 'Rajneet']);
    }
  };



  const calculateTotals = () => {
    const newTotals = {
      totalAmount: 0,
      byEmployee: {} as Record<string, number>
    };

    data.forEach(row => {
      newTotals.totalAmount += row.amount || 0;
      const employee = row.resourceName || 'Unknown';
      newTotals.byEmployee[employee] = (newTotals.byEmployee[employee] || 0) + (row.amount || 0);
    });

    setTotals(newTotals);
  };

  const handleCellEdit = (rowIndex: number, field: keyof SalaryEntry, value: any) => {
    const newData = [...data];
    newData[rowIndex] = { ...newData[rowIndex], [field]: value };
    setData(newData);
  };

  const addNewRow = () => {
    const newRow: EditableSalaryEntry = {
      date: new Date().toISOString().split('T')[0],
      month: month,
      year: year,
      resourceName: resourceNames[0] || 'Employee',
      amount: 0,
      actualPaidDate: new Date().toISOString().split('T')[0],
      isNew: true,
      isEditing: true
    };
    setData([...data, newRow]);
  };

  const deleteRow = async (index: number) => {
    const row = data[index];
    if (row.id && !row.isNew) {
      try {
        await apiService.deleteSalaryEntry(row.id);
        const newData = data.filter((_, i) => i !== index);
        setData(newData);
      } catch (error) {
        console.error('Error deleting row:', error);
      }
    } else {
      // For new rows that haven't been saved yet, just remove from local state
      const newData = data.filter((_, i) => i !== index);
      setData(newData);
    }
  };

  const saveRow = async (row: EditableSalaryEntry, index: number) => {
    try {
      console.log('Saving salary row:', row);
      
      // Prepare the data for API
      const apiData = {
        date: row.date,
        month: row.month,
        year: row.year,
        resourceName: row.resourceName,
        amount: row.amount || 0,
        actualPaidDate: row.actualPaidDate
      };
      
      if (row.isNew) {
        console.log('Creating new salary entry:', apiData);
        const result = await apiService.createSalaryEntry(apiData);
        console.log('Create result:', result);
        const newData = [...data];
        newData[index] = { ...result.entry, isEditing: false, isNew: false };
        setData(newData);
      } else {
        console.log('Updating salary entry:', row.id, apiData);
        const result = await apiService.updateSalaryEntry(row.id!, apiData);
        console.log('Update result:', result);
        const newData = [...data];
        newData[index] = { ...result.entry, isEditing: false, isNew: false };
        setData(newData);
      }
    } catch (error) {
      console.error('Error saving salary row:', error);
      alert('Error saving data. Please check console for details.');
    }
  };

  const columns = [
    { key: 'date', label: 'Date', type: 'date', width: '180px' },
    { key: 'month', label: 'Month', type: 'text', width: '120px' },
    { key: 'year', label: 'Year', type: 'number', width: '100px' },
    { key: 'resourceName', label: 'Employee', type: 'select', width: '220px', options: resourceNames },
    { key: 'amount', label: 'Amount', type: 'number', width: '180px' },
    { key: 'actualPaidDate', label: 'Paid Date', type: 'date', width: '180px' }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Salary Data - {month} {year}</h2>
          <button
            onClick={addNewRow}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Row
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto" style={{ minWidth: '100%' }}>
        <table className="w-full divide-y divide-gray-200" style={{ minWidth: 'max-content' }}>
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
              <tr key={index} className={row.isNew ? 'bg-green-50' : ''}>
                {columns.map((column) => (
                  <td key={column.key} className="px-3 py-2 whitespace-nowrap">
                    {row.isEditing ? (
                      column.type === 'select' ? (
                        <select
                          value={row[column.key as keyof SalaryEntry] || ''}
                          onChange={(e) => handleCellEdit(index, column.key as keyof SalaryEntry, e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          {column.options?.map((option: string) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={column.type}
                          value={row[column.key as keyof SalaryEntry] || ''}
                          onChange={(e) => handleCellEdit(index, column.key as keyof SalaryEntry, 
                            column.type === 'number' ? Number(e.target.value) : e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      )
                    ) : (
                      <span className="text-sm text-gray-900">
                        {column.type === 'number' 
                          ? `$${(row[column.key as keyof SalaryEntry] || 0).toLocaleString()}`
                          : row[column.key as keyof SalaryEntry]
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
              <td colSpan={2} className="px-3 py-3 text-sm font-semibold text-gray-900">TOTAL SALARIES</td>
              <td className="px-3 py-3 text-sm font-semibold text-gray-900">${totals.totalAmount.toLocaleString()}</td>
              <td className="px-3 py-3"></td>
              <td className="px-3 py-3"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Employee Breakdown */}
      <div className="px-6 py-4 border-t border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Salary Breakdown by Employee</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Object.entries(totals.byEmployee).map(([employee, amount]) => (
            <div key={employee} className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm font-medium text-gray-900">{employee}</div>
              <div className="text-lg font-semibold text-green-600">${amount.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
