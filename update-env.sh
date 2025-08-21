#!/bin/bash

echo "🔧 Updating local environment to connect to production database..."

# Check if DATABASE_URL is provided as argument
if [ -z "$1" ]; then
    echo "❌ Please provide the production DATABASE_URL as an argument"
    echo "Usage: ./update-env.sh 'postgresql://username:password@host:port/database'"
    echo ""
    echo "To get the DATABASE_URL:"
    echo "1. Go to Railway dashboard"
    echo "2. Find your deployed project"
    echo "3. Go to Variables tab"
    echo "4. Copy the DATABASE_URL value"
    exit 1
fi

PRODUCTION_DB_URL="$1"

# Update backend .env file
echo "📝 Updating backend/.env..."
cat > backend/.env << EOF
DATABASE_URL="$PRODUCTION_DB_URL"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
PORT=3001
FRONTEND_URL="http://localhost:5173"
VITE_GOOGLE_SHEETS_API_KEY=AIzaSyBL5T0mItDD8iwNYxw0gNTPn1cLto74c04
VITE_SPREADSHEET_ID=1Sgup5gOWab8q_xGkMClA0KpFo02TwcHWVQiV4Uv9mRc
EOF

# Update frontend .env.local
echo "📝 Updating .env.local..."
cat > .env.local << EOF
VITE_API_URL=http://localhost:3001/api
VITE_GOOGLE_SHEETS_API_KEY=AIzaSyBL5T0mItDD8iwNYxw0gNTPn1cLto74c04
VITE_SPREADSHEET_ID=1Sgup5gOWab8q_xGkMClA0KpFo02TwcHWVQiV4Uv9mRc
EOF

echo "✅ Environment files updated successfully!"
echo ""
echo "🔄 Next steps:"
echo "1. Restart your backend server: cd backend && npm run dev"
echo "2. Restart your frontend server: npm run dev"
echo "3. The app should now connect to your production database"
echo ""
echo "🔐 Login credentials:"
echo "Admin: admin@biryani.com / admin123"
echo "User: user@biryani.com / user123"
