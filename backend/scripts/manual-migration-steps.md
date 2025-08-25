# Manual Migration Steps: SQLite to PostgreSQL

## Current Status
✅ PostgreSQL service created on Railway  
✅ Local PostgreSQL database set up  
✅ Migration scripts created  
❌ Need to get data from Railway SQLite  

## Step 1: Get Railway Data

Since the export endpoints aren't working yet, you have a few options:

### Option A: Wait for Deployment
- Check Railway dashboard to see if deployment is complete
- Try the export endpoint again: `https://biryani-dashboard-production.up.railway.app/api/migration/export-data`

### Option B: Use Railway CLI (if available)
```bash
# Install Railway CLI if not already installed
npm install -g @railway/cli

# Login to Railway
railway login

# Connect to your project
railway link

# Run the migration script on Railway
railway run node scripts/railway-migration.js
```

### Option C: Manual Database Copy
1. Go to Railway dashboard
2. Find your PostgreSQL service
3. Get the connection string
4. Use a database tool to copy data

## Step 2: Local Migration (Once you have the data)

If you get the data as JSON or can access the Railway SQLite database:

```bash
# 1. Make sure local PostgreSQL is running
brew services start postgresql@14

# 2. Set up the database
createdb biryani_dashboard

# 3. Set the DATABASE_URL
export DATABASE_URL="postgresql://gaganmekala@localhost:5432/biryani_dashboard"

# 4. Create tables
npx prisma db push

# 5. Run migration (if you have the data)
node scripts/manual-migration.js
```

## Step 3: Copy to Railway PostgreSQL

Once you have the data in local PostgreSQL:

1. Get the Railway PostgreSQL connection string
2. Update Railway environment variables
3. Deploy the updated code

## Alternative: Direct Railway Migration

If you can access Railway directly:

1. Temporarily change Railway DATABASE_URL back to SQLite
2. Run the migration script
3. Change DATABASE_URL back to PostgreSQL
4. Deploy

## Data Summary (from previous runs)
- Users: 2
- Revenue Entries: 635
- Expense Entries: 2054
- Salary Entries: 542 (including Saanvi's July 2025 entries)

All this data needs to be preserved during migration.
