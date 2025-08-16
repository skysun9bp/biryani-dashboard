# Biryani Dashboard Backend

Backend API for the Biryani Dashboard with database integration, authentication, and data management.

## 🚀 Features

- **Authentication**: JWT-based authentication with user roles
- **Database**: SQLite (development) / PostgreSQL (production) with Prisma ORM
- **API Endpoints**: Complete CRUD operations for revenue, expenses, and salaries
- **Dashboard Analytics**: Aggregated data for charts and summaries
- **Security**: Password hashing, CORS, Helmet middleware

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## 🛠️ Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Copy the example environment file:
```bash
cp env.example .env
```

Update the `.env` file with your configuration:
```env
# Database
DATABASE_URL="file:./dev.db"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Server
PORT=3001

# CORS
FRONTEND_URL="http://localhost:5173"
```

### 3. Database Setup
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed initial data
npm run db:seed
```

### 4. Start Development Server
```bash
npm run dev
```

The server will start on `http://localhost:3001`

## 📊 Database Schema

### Users
- Authentication and authorization
- Role-based access (ADMIN, USER)

### Revenue Entries
- Daily revenue tracking
- Multiple payment methods
- Commission fees tracking

### Expense Entries
- Categorized expenses
- Vendor information
- Cost type classification

### Salary Entries
- Employee salary tracking
- Payment date tracking

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### Revenue
- `GET /api/revenue` - Get revenue entries
- `POST /api/revenue` - Create revenue entry
- `PUT /api/revenue/:id` - Update revenue entry
- `DELETE /api/revenue/:id` - Delete revenue entry

### Expenses
- `GET /api/expense` - Get expense entries
- `POST /api/expense` - Create expense entry
- `PUT /api/expense/:id` - Update expense entry
- `DELETE /api/expense/:id` - Delete expense entry
- `GET /api/expense/categories/cost-types` - Get cost types

### Salaries
- `GET /api/salary` - Get salary entries
- `POST /api/salary` - Create salary entry
- `PUT /api/salary/:id` - Update salary entry
- `DELETE /api/salary/:id` - Delete salary entry
- `GET /api/salary/resources/names` - Get resource names

### Dashboard
- `GET /api/dashboard/summary` - Get summary data
- `GET /api/dashboard/revenue-analytics` - Get revenue analytics
- `GET /api/dashboard/expense-analytics` - Get expense analytics
- `GET /api/dashboard/salary-analytics` - Get salary analytics

## 🔐 Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Default Users
- **Admin**: `admin@biryani.com` / `admin123`
- **User**: `user@biryani.com` / `user123`

## 🛠️ Development

### Available Scripts
- `npm run dev` - Start development server with hot reload
- `npm start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed database with initial data

### Database Management
```bash
# View database in Prisma Studio
npm run db:studio

# Reset database
rm prisma/dev.db
npm run db:push
npm run db:seed
```

## 🚀 Production Deployment

### Railway
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically

### Heroku
1. Create Heroku app
2. Add PostgreSQL addon
3. Set environment variables
4. Deploy

### Environment Variables for Production
```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-production-secret"
PORT=3001
FRONTEND_URL="https://your-frontend-domain.com"
```

## 📝 API Documentation

### Request/Response Examples

#### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@biryani.com", "password": "admin123"}'
```

#### Create Revenue Entry
```bash
curl -X POST http://localhost:3001/api/revenue \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2024-12-01",
    "month": "Dec",
    "year": 2024,
    "cashInReport": 1000,
    "card": 500,
    "dd": 200
  }'
```

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check DATABASE_URL in .env
   - Run `npm run db:push`

2. **JWT Token Error**
   - Check JWT_SECRET in .env
   - Ensure token is valid and not expired

3. **CORS Error**
   - Check FRONTEND_URL in .env
   - Ensure frontend URL matches

## 📞 Support

For issues and questions, please check the main project documentation or create an issue in the repository.


