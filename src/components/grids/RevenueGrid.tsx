import React, { useState, useEffect } from 'react';
import { apiService, RevenueEntry } from '../../services/api';

interface RevenueGridProps {
  year: number;
  month: string;
}

interface EditableRevenueEntry extends RevenueEntry {
  isEditing?: boolean;
  isNew?: boolean;
}

export default function RevenueGrid({ year, month }: RevenueGridProps) {
  const [data, setData] = useState<EditableRevenueEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totals, setTotals] = useState({
    cashInReport: 0,
    card: 0,
    dd: 0,
    ue: 0,
    gh: 0,
    cn: 0,
    catering: 0,
    otherCash: 0,
    foodja: 0,
    zelle: 0,
    ezCater: 0,
    relish: 0,
    waiterCom: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    loadData();
  }, [year, month]);

  useEffect(() => {
    calculateTotals();
  }, [data]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      console.log('Loading revenue data for:', year, month);
      
      // Fetch actual revenue entries from the database
      const response = await apiService.getRevenueEntries({ year, month });
      console.log('Revenue API response:', response);
      
      const revenueEntries = response?.entries || [];
      console.log('Revenue entries found:', revenueEntries.length);
      
      // Convert to editable format
      const editableData = revenueEntries.map((item: any) => {
        console.log('Processing revenue item:', item);
        return {
          id: item.id,
          date: item.date ? new Date(item.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          month: month,
          year: year,
          cashInReport: item.cashInReport || 0,
          card: item.card || 0,
          dd: item.dd || 0,
          ue: item.ue || 0,
          gh: item.gh || 0,
          cn: item.cn || 0,
          catering: item.catering || 0,
          otherCash: item.otherCash || 0,
          foodja: item.foodja || 0,
          zelle: item.zelle || 0,
          ezCater: item.ezCater || 0,
          relish: item.relish || 0,
          waiterCom: item.waiterCom || 0,
          ccFees: item.ccFees || 0,
          ddFees: item.ddFees || 0,
          ueFees: item.ueFees || 0,
          ghFees: item.ghFees || 0,
          foodjaFees: item.foodjaFees || 0,
          ezCaterFees: item.ezCaterFees || 0,
          relishFees: item.relishFees || 0,
          isEditing: false,
          isNew: false
        };
      });
      
      console.log('Processed revenue data:', editableData);
      setData(editableData);
    } catch (error) {
      console.error('Error loading revenue data:', error);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotals = () => {
    const newTotals = {
      cashInReport: 0,
      card: 0,
      dd: 0,
      ue: 0,
      gh: 0,
      cn: 0,
      catering: 0,
      otherCash: 0,
      foodja: 0,
      zelle: 0,
      ezCater: 0,
      relish: 0,
      waiterCom: 0,
      totalRevenue: 0
    };

    data.forEach(row => {
      newTotals.cashInReport += row.cashInReport || 0;
      newTotals.card += row.card || 0;
      newTotals.dd += row.dd || 0;
      newTotals.ue += row.ue || 0;
      newTotals.gh += row.gh || 0;
      newTotals.cn += row.cn || 0;
      newTotals.catering += row.catering || 0;
      newTotals.otherCash += row.otherCash || 0;
      newTotals.foodja += row.foodja || 0;
      newTotals.zelle += row.zelle || 0;
      newTotals.ezCater += row.ezCater || 0;
      newTotals.relish += row.relish || 0;
      newTotals.waiterCom += row.waiterCom || 0;
    });

    newTotals.totalRevenue = Object.values(newTotals).reduce((sum, val) => sum + val, 0);
    setTotals(newTotals);
  };

  const handleCellEdit = (rowIndex: number, field: keyof RevenueEntry, value: any) => {
    const newData = [...data];
    newData[rowIndex] = { ...newData[rowIndex], [field]: value };
    setData(newData);
  };

  const addNewRow = () => {
    const newRow: EditableRevenueEntry = {
      date: new Date().toISOString().split('T')[0],
      month: month,
      year: year,
      cashInReport: 0,
      card: 0,
      dd: 0,
      ue: 0,
      gh: 0,
      cn: 0,
      catering: 0,
      otherCash: 0,
      foodja: 0,
      zelle: 0,
      ezCater: 0,
      relish: 0,
      waiterCom: 0,
      ccFees: 0,
      ddFees: 0,
      ueFees: 0,
      ghFees: 0,
      foodjaFees: 0,
      ezCaterFees: 0,
      relishFees: 0,
      isNew: true,
      isEditing: true
    };
    setData([...data, newRow]);
  };

  const deleteRow = async (index: number) => {
    const row = data[index];
    if (row.id && !row.isNew) {
      try {
        await apiService.deleteRevenueEntry(row.id);
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

  const saveRow = async (row: EditableRevenueEntry, index: number) => {
    try {
      if (row.isNew) {
        const result = await apiService.createRevenueEntry(row);
        const newData = [...data];
        newData[index] = { ...result.entry, isEditing: false, isNew: false };
        setData(newData);
      } else {
        const result = await apiService.updateRevenueEntry(row.id!, row);
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
    { key: 'cashInReport', label: 'Cash in Report', type: 'number', width: '140px' },
    { key: 'card', label: 'Card', type: 'number', width: '100px' },
    { key: 'dd', label: 'DD', type: 'number', width: '100px' },
    { key: 'ue', label: 'UE', type: 'number', width: '100px' },
    { key: 'gh', label: 'GH', type: 'number', width: '100px' },
    { key: 'cn', label: 'CN', type: 'number', width: '100px' },
    { key: 'catering', label: 'Catering', type: 'number', width: '120px' },
    { key: 'otherCash', label: 'Other Cash', type: 'number', width: '120px' },
    { key: 'foodja', label: 'Foodja', type: 'number', width: '100px' },
    { key: 'zelle', label: 'Zelle', type: 'number', width: '100px' },
    { key: 'ezCater', label: 'EZ Cater', type: 'number', width: '120px' },
    { key: 'relish', label: 'Relish', type: 'number', width: '100px' },
    { key: 'waiterCom', label: 'Waiter Com', type: 'number', width: '120px' }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Revenue Data - {month} {year}</h2>
          <button
            onClick={addNewRow}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
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
              <tr key={index} className={row.isNew ? 'bg-blue-50' : ''}>
                {columns.map((column) => (
                  <td key={column.key} className="px-3 py-2 whitespace-nowrap">
                    {row.isEditing ? (
                      <input
                        type={column.type}
                        value={row[column.key as keyof RevenueEntry] || ''}
                        onChange={(e) => handleCellEdit(index, column.key as keyof RevenueEntry, 
                          column.type === 'number' ? Number(e.target.value) : e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <span className="text-sm text-gray-900">
                        {column.type === 'number' 
                          ? `$${(row[column.key as keyof RevenueEntry] || 0).toLocaleString()}`
                          : row[column.key as keyof RevenueEntry]
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
              <td className="px-3 py-3 text-sm font-semibold text-gray-900">TOTALS</td>
              <td className="px-3 py-3 text-sm font-semibold text-gray-900">${totals.cashInReport.toLocaleString()}</td>
              <td className="px-3 py-3 text-sm font-semibold text-gray-900">${totals.card.toLocaleString()}</td>
              <td className="px-3 py-3 text-sm font-semibold text-gray-900">${totals.dd.toLocaleString()}</td>
              <td className="px-3 py-3 text-sm font-semibold text-gray-900">${totals.ue.toLocaleString()}</td>
              <td className="px-3 py-3 text-sm font-semibold text-gray-900">${totals.gh.toLocaleString()}</td>
              <td className="px-3 py-3 text-sm font-semibold text-gray-900">${totals.cn.toLocaleString()}</td>
              <td className="px-3 py-3 text-sm font-semibold text-gray-900">${totals.catering.toLocaleString()}</td>
              <td className="px-3 py-3 text-sm font-semibold text-gray-900">${totals.otherCash.toLocaleString()}</td>
              <td className="px-3 py-3 text-sm font-semibold text-gray-900">${totals.foodja.toLocaleString()}</td>
              <td className="px-3 py-3 text-sm font-semibold text-gray-900">${totals.zelle.toLocaleString()}</td>
              <td className="px-3 py-3 text-sm font-semibold text-gray-900">${totals.ezCater.toLocaleString()}</td>
              <td className="px-3 py-3 text-sm font-semibold text-gray-900">${totals.relish.toLocaleString()}</td>
              <td className="px-3 py-3 text-sm font-semibold text-gray-900">${totals.waiterCom.toLocaleString()}</td>
              <td className="px-3 py-3 text-sm font-semibold text-gray-900"></td>
            </tr>
            <tr className="bg-blue-50">
              <td className="px-3 py-3 text-sm font-bold text-blue-900">TOTAL REVENUE</td>
              <td colSpan={13} className="px-3 py-3 text-sm font-bold text-blue-900">${totals.totalRevenue.toLocaleString()}</td>
              <td className="px-3 py-3"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
