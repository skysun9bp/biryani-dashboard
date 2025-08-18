import React, { useState } from "react";
import { apiService } from "../services/api";

export function ExportButton() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState("");

  const handleExport = async () => {
    setIsExporting(true);
    setExportStatus("Preparing data...");
    
    try {
      // Fetch all data from API
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.toLocaleString('default', { month: 'short' });
      
      const response = await apiService.getFinancialData(currentYear, currentMonth);
      const { financialData, expenseBreakdown, salaryBreakdown } = response;
      
      setExportStatus("Generating CSV...");
      
      // Calculate summary data from API response
      const totalRevenue = financialData.reduce((sum: number, item: any) => sum + (item.revenue || 0), 0);
      const totalExpenses = financialData.reduce((sum: number, item: any) => sum + (item.expenses || 0), 0);
      const totalSalaries = financialData.reduce((sum: number, item: any) => sum + (item.salaries || 0), 0);
      const netProfit = financialData.reduce((sum: number, item: any) => sum + (item.netProfit || 0), 0);
      
      // Create CSV content
      let csvContent = "data:text/csv;charset=utf-8,";
      
      // Add summary section
      csvContent += "FINANCIAL SUMMARY\n";
      csvContent += "Metric,Value\n";
      csvContent += `Total Revenue,$${totalRevenue.toLocaleString()}\n`;
      csvContent += `Total Expenses,$${totalExpenses.toLocaleString()}\n`;
      csvContent += `Total Salaries,$${totalSalaries.toLocaleString()}\n`;
      csvContent += `Net Profit,$${netProfit.toLocaleString()}\n`;
      csvContent += `Gross Margin,${totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue * 100).toFixed(1) : 0}%\n\n`;
      
      // Add revenue data
      csvContent += "REVENUE DATA\n";
      csvContent += "Date,Month,Year,Cash in Report,Card,DD,UE,GH,CN,Catering,Other Cash,Foodja,Zelle,Ez Cater,Relish,waiter.com,Total\n";
      
      revenueData.forEach(row => {
        const cashInReport = parseFloat(row["Cash in Report"] || "0");
        const card = parseFloat(row["Card"] || "0");
        const dd = parseFloat(row["DD"] || "0");
        const ue = parseFloat(row["UE"] || "0");
        const gh = parseFloat(row["GH"] || "0");
        const cn = parseFloat(row["CN"] || "0");
        const catering = parseFloat(row["Catering"] || "0");
        const otherCash = parseFloat(row["Other Cash"] || "0");
        const foodja = parseFloat(row["Foodja"] || "0");
        const zelle = parseFloat(row["Zelle"] || "0");
        const ezCater = parseFloat(row["Ez Cater"] || "0");
        const relish = parseFloat(row["Relish"] || "0");
        const waiterCom = parseFloat(row["waiter.com"] || "0");
        
        const total = cashInReport + card + dd + ue + gh + cn + catering + otherCash + foodja + zelle + ezCater + relish + waiterCom;
        
        csvContent += `${row["Date"] || ""},${row["Month"] || ""},${row["Year"] || ""},${cashInReport},${card},${dd},${ue},${gh},${cn},${catering},${otherCash},${foodja},${zelle},${ezCater},${relish},${waiterCom},${total}\n`;
      });
      
      csvContent += "\n";
      
      // Add expense data
      csvContent += "EXPENSE DATA\n";
      csvContent += "Item (Vendor),Date,Month,Year,Expense Type,Cost Type,Payment Type,Check No,Amount\n";
      
      expenseData.forEach(row => {
        csvContent += `"${row["Item (Vendor)"] || ""}",${row["Date"] || ""},${row["Month"] || ""},${row["Year"] || ""},"${row["Expense Type"] || ""}","${row["Cost Type"] || ""}","${row["Payment Type"] || ""}",${row["Check No"] || ""},${row["Amount"] || ""}\n`;
      });
      
      csvContent += "\n";
      
      // Add salary data
      csvContent += "SALARY DATA\n";
      csvContent += "Resource Name,Active,Pay Period,Month,Year,Actual Paid Date,Amount,Mode,Comments\n";
      
      salaryData.forEach(row => {
        csvContent += `"${row["Resource Name"] || ""}",${row["Active"] || ""},${row["Pay Period"] || ""},${row["Month"] || ""},${row["Year"] || ""},${row["Actual Paid Date"] || ""},${row["Amount"] || ""},"${row["Mode"] || ""}","${row["Comments"] || ""}"\n`;
      });
      
      setExportStatus("Downloading file...");
      
      // Create download link
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `biryani-financial-report-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setExportStatus("Export completed successfully!");
      setTimeout(() => {
        setExportStatus("");
        setIsExporting(false);
      }, 2000);
      
    } catch (error) {
      console.error("Export failed:", error);
      setExportStatus("Export failed. Please try again.");
      setTimeout(() => {
        setExportStatus("");
        setIsExporting(false);
      }, 3000);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleExport}
        disabled={isExporting}
        className={`flex items-center space-x-3 px-6 py-3 rounded-xl shadow-lg transition-all duration-200 font-medium ${
          isExporting
            ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:shadow-xl transform hover:scale-105'
        }`}
      >
        {isExporting ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Exporting...</span>
          </>
        ) : (
          <>
            <span className="text-xl">📊</span>
            <span>Export Data</span>
          </>
        )}
      </button>
      
      {exportStatus && (
        <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-2 text-sm text-gray-700 whitespace-nowrap">
          {exportStatus}
        </div>
      )}
    </div>
  );
}