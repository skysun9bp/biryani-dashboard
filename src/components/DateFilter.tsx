import React from "react";

interface DateFilterProps {
  selectedYear: string;
  selectedMonth: string;
  onYearChange: (year: string) => void;
  onMonthChange: (month: string) => void;
  showMonthFilter?: boolean;
  className?: string;
}

export function DateFilter({ 
  selectedYear, 
  selectedMonth, 
  onYearChange, 
  onMonthChange, 
  showMonthFilter = true,
  className = ""
}: DateFilterProps) {
  // Generate years (current year - 5 to current year + 1)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 7 }, (_, i) => (currentYear - 5 + i).toString());

  // Months array
  const months = [
    { value: "Jan", label: "January" },
    { value: "Feb", label: "February" },
    { value: "Mar", label: "March" },
    { value: "Apr", label: "April" },
    { value: "May", label: "May" },
    { value: "Jun", label: "June" },
    { value: "Jul", label: "July" },
    { value: "Aug", label: "August" },
    { value: "Sep", label: "September" },
    { value: "Oct", label: "October" },
    { value: "Nov", label: "November" },
    { value: "Dec", label: "December" }
  ];

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className="flex items-center space-x-2">
        <label className="text-sm font-medium text-gray-700">Year:</label>
        <select
          value={selectedYear}
          onChange={(e) => onYearChange(e.target.value)}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
        >
          <option value="">All Years</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
      
      {showMonthFilter && (
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Month:</label>
          <select
            value={selectedMonth}
            onChange={(e) => onMonthChange(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
          >
            <option value="">All Months</option>
            {months.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
