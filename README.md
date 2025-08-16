# 🍛 Biryani Dashboard

A comprehensive financial dashboard for restaurant management with Google Sheets data migration, real-time reporting, and modern web interface.

## ✨ Features

- **📊 Financial Dashboard**: Revenue, expense, and salary tracking
- **🔄 Data Migration**: Import data from Google Sheets with 98.2% success rate
- **📈 Advanced Reports**: Charts, trends, and financial analysis
- **🔐 Authentication**: Secure login system with JWT
- **📝 Data Entry**: Manual data entry forms
- **📤 Export Functionality**: Export data for external analysis
- **🎨 Modern UI**: Beautiful, responsive design

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Google Sheets API access

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/skysun9bp/biryani-dashboard.git
   cd biryani-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd backend && npm install
   ```

3. **Set up environment variables**
   ```bash
   # Frontend (.env.local)
   VITE_API_URL=http://localhost:3001
   
   # Backend (backend/.env)
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="your-super-secret-jwt-key"
   PORT=3001
   FRONTEND_URL="http://localhost:5173"
   VITE_GOOGLE_SHEETS_API_KEY=your_api_key
   VITE_SPREADSHEET_ID=your_spreadsheet_id
   ```

4. **Set up database**
   ```bash
   cd backend
   npx prisma db push
   npm run db:seed
   ```

5. **Run the application**
   ```bash
   # Terminal 1 - Backend
   cd backend && npm run dev
   
   # Terminal 2 - Frontend
   npm run dev
   ```

6. **Access the dashboard**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001
   - Login: admin@biryani.com / admin123

## 📊 Data Migration

### From Google Sheets
```bash
cd backend
npm run migrate:final
```

### Analyze Failed Entries
```bash
cd backend
node analyze-failed-entries.js
```

## 🚀 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend (Railway/Heroku)
1. Deploy backend to Railway or Heroku
2. Update `VITE_API_URL` in frontend environment
3. Set production environment variables

## 📁 Project Structure

```
biryani-dashboard/
├── src/                    # Frontend React app
│   ├── components/         # React components
│   ├── contexts/          # React contexts
│   ├── services/          # API services
│   └── scripts/           # Migration scripts
├── backend/               # Backend Express.js app
│   ├── src/              # Backend source code
│   ├── prisma/           # Database schema
│   └── scripts/          # Backend scripts
└── docs/                 # Documentation
```

## 🔧 Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Backend
- `npm run dev` - Start development server
- `npm run migrate:final` - Run data migration
- `npm run db:seed` - Seed database with users
- `node analyze-failed-entries.js` - Analyze migration failures

## 📊 Database Schema

- **RevenueEntry**: Daily revenue tracking
- **ExpenseEntry**: Expense categorization and tracking
- **SalaryEntry**: Employee salary management
- **User**: Authentication and user management

## 🔐 Authentication

Default users:
- **Admin**: admin@biryani.com / admin123
- **User**: user@biryani.com / user123

## 📈 Reports & Analytics

- Monthly/yearly financial summaries
- Expense breakdown by category
- Revenue trends and analysis
- Salary distribution charts
- Export functionality for external analysis

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation in `/docs`
- Review migration guides
- Open an issue on GitHub

---

**Built with ❤️ for restaurant management**
