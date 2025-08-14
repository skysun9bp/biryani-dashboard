# 🍛 Biryani Dashboard

A modern, real-time financial dashboard for restaurant management that connects directly to Google Sheets for live data visualization.

![Dashboard Preview](https://img.shields.io/badge/Status-Live%20Data-brightgreen) ![React](https://img.shields.io/badge/React-18-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue) ![Vite](https://img.shields.io/badge/Vite-4.5-orange)

## ✨ Features

### 📊 **Real-Time Data Integration**
- **Live Google Sheets Connection**: Direct integration with Google Sheets API
- **Automatic Data Refresh**: Real-time updates from your spreadsheet
- **Fallback to Demo Data**: Graceful handling when API is unavailable

### 💰 **Financial Analytics**
- **Revenue Tracking**: Daily, monthly, quarterly, and yearly revenue analysis
- **Expense Management**: Categorized expense tracking with drill-down capabilities
- **Salary Management**: Employee payroll tracking with month-over-month comparison
- **Net Income Calculation**: Automated profit calculations with sales tax considerations

### 📈 **Advanced Visualizations**
- **Interactive Charts**: Bar charts, pie charts, area charts, and line charts
- **Drill-Down Capabilities**: Click to explore detailed expense breakdowns
- **Time Period Navigation**: Switch between current month, last month, quarters, and years
- **Year-over-Year Comparisons**: Track performance trends over time

### 🎯 **Key Metrics Dashboard**
- **Summary Cards**: Quick overview of revenue, expenses, and net income
- **Recent Transactions**: Latest revenue, expense, and salary entries
- **Top Performers**: Highest revenue days and largest expense categories
- **Employee Insights**: Salary distribution and payroll analysis

### 📋 **Data Management**
- **CSV Export**: Download comprehensive financial reports
- **Multi-Sheet Support**: Revenue, Expenses, and Salaries sheets
- **Column Mapping**: Flexible data structure adaptation
- **Error Handling**: Robust error management and user feedback

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Google Sheets API access

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/biryani-dashboard.git
   cd biryani-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your Google Sheets credentials:
   ```env
   VITE_GOOGLE_SHEETS_API_KEY=your_api_key_here
   VITE_SPREADSHEET_ID=your_spreadsheet_id_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 🔧 Google Sheets Setup

### 1. Create Google Sheets API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google Sheets API
4. Create credentials (API Key)
5. Restrict the API key to Google Sheets API only

### 2. Prepare Your Spreadsheet
Your Google Sheet should have three main sheets:

#### **Net Sale Sheet** (Revenue Data)
Required columns:
- `Column 1`: Date
- `Year`: Year
- `Month`: Month (short format: Jan, Feb, etc.)
- `Cash in Report`, `Card`, `DD`, `UE`, `GH`, `CN`, `Catering`, `Other Cash`, `Foodja`, `Zelle`, `Ez Cater`, `Relish`, `waiter.com`: Payment methods
- `Card2`, `DD2`, `UE2`, `GH2`, `Foodja2`, `EzCater2`, `Relish2`, `waiter.com2`: Net income columns

#### **Expenses Sheet** (Expense Data)
Required columns:
- `Item (Vendor)`: Vendor name
- `Date`: Expense date
- `Month`: Month
- `Year`: Year
- `Expense Type`: Category of expense
- `Cost Type`: High-level expense category
- `Amount`: Expense amount

#### **Salaries Sheet** (Payroll Data)
Required columns:
- `Resource Name`: Employee name
- `Month`: Month
- `Year`: Year
- `Actual Paid Date`: Payment date
- `Amount`: Salary amount
- `Mode`: Payment method
- `Pay Period`: Pay period information

### 3. Share Your Spreadsheet
- Make your Google Sheet accessible to "Anyone with the link" (read-only)
- Or use service account authentication for production

## 📁 Project Structure

```
biryani-dashboard/
├── src/
│   ├── components/
│   │   ├── Sidebar.tsx          # Navigation sidebar
│   │   ├── Topbar.tsx           # Header with live data indicator
│   │   ├── SummaryCard.tsx      # Financial summary cards
│   │   ├── RevenueChart.tsx     # Revenue analytics and charts
│   │   ├── ExpenseChart.tsx     # Expense analytics and charts
│   │   ├── SalaryChart.tsx      # Salary analytics and charts
│   │   ├── ExpenseDetails.tsx   # Detailed expense breakdown
│   │   └── ExportButton.tsx     # CSV export functionality
│   ├── utils/
│   │   └── fetchSheet.ts        # Google Sheets API integration
│   ├── App.tsx                  # Main application component
│   ├── main.tsx                 # Application entry point
│   └── index.css                # Global styles
├── public/                      # Static assets
├── .env.local                   # Environment variables (not in git)
├── .gitignore                   # Git ignore rules
├── package.json                 # Dependencies and scripts
├── tailwind.config.js           # Tailwind CSS configuration
├── vite.config.ts               # Vite build configuration
└── README.md                    # This file
```

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🔒 Security

- **Environment Variables**: API keys are stored in `.env.local` (not committed to git)
- **API Key Restrictions**: Google Sheets API key should be restricted to specific domains
- **Read-Only Access**: Spreadsheet access is read-only for security

## 🎨 Customization

### Styling
The dashboard uses Tailwind CSS for styling. Customize colors and themes in `tailwind.config.js`.

### Data Structure
Modify the column mappings in the components to match your specific Google Sheets structure.

### Charts
All charts are built with Recharts. Customize chart types, colors, and interactions in the respective chart components.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues:

1. Check the [Google Sheets Setup Guide](GOOGLE_SHEETS_SETUP.md)
2. Verify your API key and spreadsheet permissions
3. Check the browser console for error messages
4. Open an issue on GitHub with detailed information

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Netlify
1. Connect your GitHub repository to Netlify
2. Add environment variables in Netlify dashboard
3. Set build command: `npm run build`
4. Set publish directory: `dist`

### Other Platforms
The dashboard can be deployed to any static hosting platform that supports environment variables.

---

**Built with ❤️ for restaurant management**
