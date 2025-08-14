
import React, { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";
import { SummaryCard } from "./components/SummaryCard";
import { RevenueChart } from "./components/RevenueChart";
import { ExpenseChart } from "./components/ExpenseChart";
import { SalaryChart } from "./components/SalaryChart";
import { ExportButton } from "./components/ExportButton";
import { fetchSheetData } from "./utils/fetchSheet";

function RevenueTable() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    async function loadData() {
      const revenueData = await fetchSheetData("Net Sale");
      
      // Get current month and year
      const currentDate = new Date();
      const currentMonth = currentDate.toLocaleString('default', { month: 'short' });
      const currentYear = currentDate.getFullYear().toString();

      // Filter data for current month
      const currentMonthData = revenueData.filter(row => {
        const rowMonth = row["Month"] || "";
        const rowYear = row["Year"] || "";
        return rowMonth === currentMonth && rowYear === currentYear;
      });

      // Sort by Column 1 date (most recent first) and take the latest 5 entries
      const sortedData = currentMonthData
        .sort((a, b) => {
          const dateA = new Date(a["Column 1"] || "1900-01-01");
          const dateB = new Date(b["Column 1"] || "1900-01-01");
          return dateB.getTime() - dateA.getTime();
        })
        .slice(0, 5);

      // Calculate total revenue for the month
      const totalRev = currentMonthData.reduce((sum, item) => {
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

      setData(sortedData);
      setTotalRevenue(totalRev);
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Revenues</h3>
        <div className="text-sm text-gray-500">Month Total: ${totalRevenue.toLocaleString()}</div>
      </div>
      <div className="space-y-3">
        {data.map((item, index) => {
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
          
          const total = cashInReport + card + dd + ue + gh + cn + catering + otherCash + foodja + zelle + ezCater + relish + waiterCom;
          
          return (
            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{item["Column 1"] || "Unknown Date"}</p>
                <p className="text-sm text-gray-600">{item["Month"] || ""} {item["Year"] || ""}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-600">${total.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Total Revenue</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ExpenseTable() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalExpenses, setTotalExpenses] = useState(0);

  useEffect(() => {
    async function loadData() {
      const expenseData = await fetchSheetData("Expenses");
      
      // Get current month and year
      const currentDate = new Date();
      const currentMonth = currentDate.toLocaleString('default', { month: 'short' });
      const currentYear = currentDate.getFullYear().toString();

      // Filter data for current month
      const currentMonthData = expenseData.filter(row => {
        const rowMonth = row["Month"] || "";
        const rowYear = row["Year"] || "";
        return rowMonth === currentMonth && rowYear === currentYear;
      });

      // Sort by date (most recent first) and take the latest 5 entries
      const sortedData = currentMonthData
        .sort((a, b) => {
          const dateA = new Date(a["Date"] || "1900-01-01");
          const dateB = new Date(b["Date"] || "1900-01-01");
          return dateB.getTime() - dateA.getTime();
        })
        .slice(0, 5);

      // Calculate total expenses for the month
      const totalExp = currentMonthData.reduce((sum, item) => {
        return sum + parseFloat(item["Amount"] || "0");
      }, 0);

      setData(sortedData);
      setTotalExpenses(totalExp);
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Top Expenses</h3>
        <div className="text-sm text-gray-500">Month Total: ${totalExpenses.toLocaleString()}</div>
      </div>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">{item["Item (Vendor)"] || "Unknown Vendor"}</p>
              <p className="text-sm text-gray-600">{item["Expense Type"] || ""} • {item["Date"] || ""}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-red-600">${parseFloat(item["Amount"] || "0").toLocaleString()}</p>
              <p className="text-xs text-gray-500">{item["Cost Type"] || ""}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SalaryTable() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalSalaries, setTotalSalaries] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState<'current' | 'previous'>('current');

  useEffect(() => {
    async function loadData() {
      const salaryData = await fetchSheetData("Salaries");
      
      // Get current month and year
      const currentDate = new Date();
      let targetMonth, targetYear;
      
      if (selectedMonth === 'current') {
        targetMonth = currentDate.toLocaleString('default', { month: 'short' });
        targetYear = currentDate.getFullYear().toString();
      } else {
        // Previous month
        const previousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
        targetMonth = previousMonth.toLocaleString('default', { month: 'short' });
        targetYear = previousMonth.getFullYear().toString();
      }

      // Filter data for target month
      const targetMonthData = salaryData.filter(row => {
        const rowMonth = row["Month"] || "";
        const rowYear = row["Year"] || "";
        return rowMonth === targetMonth && rowYear === targetYear;
      });

      // Sort by actual paid date (most recent first) and take the latest 5 entries
      const sortedData = targetMonthData
        .sort((a, b) => {
          const dateA = new Date(a["Actual Paid Date"] || "1900-01-01");
          const dateB = new Date(b["Actual Paid Date"] || "1900-01-01");
          return dateB.getTime() - dateA.getTime();
        })
        .slice(0, 5);

      // Calculate total salaries for the month
      const totalSal = targetMonthData.reduce((sum, item) => {
        return sum + parseFloat(item["Amount"] || "0");
      }, 0);

      setData(sortedData);
      setTotalSalaries(totalSal);
      setLoading(false);
    }
    loadData();
  }, [selectedMonth]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Employee Salaries</h3>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">Month Total: ${totalSalaries.toLocaleString()}</div>
          <div className="flex bg-gray-200 rounded-lg p-1">
            <button
              onClick={() => setSelectedMonth('current')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                selectedMonth === 'current'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setSelectedMonth('previous')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                selectedMonth === 'previous'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Last Month
            </button>
          </div>
        </div>
      </div>
      <div className="space-y-3">
        {data.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No salary data found for {selectedMonth === 'current' ? 'this month' : 'last month'}</p>
          </div>
        ) : (
          data.map((item, index) => (
            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{item["Resource Name"] || "Unknown Employee"}</p>
                <p className="text-sm text-gray-600">{item["Pay Period"] || ""} • {item["Actual Paid Date"] || ""}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-blue-600">${parseFloat(item["Amount"] || "0").toLocaleString()}</p>
                <p className="text-xs text-gray-500">{item["Mode"] || ""}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="space-y-6">
            <SummaryCard />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RevenueChart />
              <ExpenseChart />
            </div>
            <SalaryChart />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <RevenueTable />
              <ExpenseTable />
              <SalaryTable />
            </div>
            <ExportButton />
          </div>
        );
      case "revenue":
        return <RevenueChart />;
      case "expenses":
        return <ExpenseChart />;
      case "employees":
        return <SalaryChart />;
      case "inventory":
        return (
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Inventory Management</h2>
            <p className="text-gray-600">Inventory management features coming soon...</p>
          </div>
        );
      case "reports":
        return (
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Reports</h2>
            <p className="text-gray-600">Advanced reporting features coming soon...</p>
          </div>
        );
      case "settings":
        return (
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Settings</h2>
            <p className="text-gray-600">Settings and configuration options coming soon...</p>
          </div>
        );
      default:
        return <SummaryCard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="flex-1">
          <Topbar />
          <main className="p-6">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
