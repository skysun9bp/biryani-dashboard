# 🚀 Google Sheets to Database Migration Guide

This guide will help you migrate your existing Google Sheets data to the new Biryani Dashboard database system.

## 📋 Prerequisites

Before starting the migration, ensure you have:

1. ✅ **Google Sheets API Key** - You should already have this from the previous setup
2. ✅ **Database Setup** - Your database should be running and migrations applied
3. ✅ **Environment Variables** - Your `.env.local` file should be configured

## 🔧 Setup Verification

First, let's verify your setup:

```bash
# Check if your environment variables are set
cat .env.local | grep -E "(SPREADSHEET_ID|GOOGLE_SHEETS_API_KEY)"
```

You should see:
```
VITE_SPREADSHEET_ID=your_spreadsheet_id_here
VITE_GOOGLE_SHEETS_API_KEY=your_api_key_here
```

## 📊 Migration Process

### Step 1: Create a Backup (Optional but Recommended)

If you have existing data in your database, create a backup first:

```bash
npm run backup
```

This will create a backup file in the `backups/` directory.

### Step 2: Run the Migration

Execute the migration script:

```bash
npm run migrate
```

The script will:
- 🔗 Connect to your Google Sheets
- 📥 Fetch data from all three sheets (Net Sale, Expenses, Salaries)
- 🔄 Transform and validate the data
- 💾 Insert records into your database
- 📊 Provide a detailed summary

### Step 3: Verify the Migration

After migration, you can verify the data:

1. **Check the migration summary** - The script will show you exactly how many records were migrated
2. **Visit your dashboard** - Go to `http://localhost:5174` to see your data
3. **Review the data** - Check that all your revenue, expenses, and salary data appears correctly

## 🔍 What the Migration Does

### Revenue Data (Net Sale Sheet)
- Maps all payment methods (Cash, Card, DD, UE, GH, etc.)
- Handles fees for each payment method
- Preserves dates and amounts
- Creates monthly and yearly aggregations

### Expense Data (Expenses Sheet)
- Imports cost types and expense types
- Preserves vendor information
- Maintains date and amount data
- Categorizes expenses properly

### Salary Data (Salaries Sheet)
- Imports employee names and amounts
- Handles payment dates
- Preserves all salary information

## ⚠️ Important Notes

### Duplicate Prevention
The migration script automatically prevents duplicates by checking for existing entries with the same:
- Date
- Amount
- Type/Description

### Data Validation
The script validates:
- Date formats (supports multiple formats)
- Numeric values (removes currency symbols)
- Required fields

### Error Handling
If any records fail to migrate, the script will:
- Log the specific error
- Continue with other records
- Show you exactly which records failed and why

## 🛠️ Troubleshooting

### Common Issues

**1. "Missing Google Sheets configuration"**
```bash
# Check your .env.local file
cat .env.local
```

**2. "Google Sheets connection failed"**
- Verify your API key is correct
- Check that your spreadsheet ID is correct
- Ensure your Google Sheets is publicly accessible

**3. "No data found in sheet"**
- Check that your sheet names are exactly: "Net Sale", "Expenses", "Salaries"
- Verify your sheets have data (not empty)

**4. "Database connection failed"**
- Ensure your backend is running: `cd backend && npm run dev`
- Check your database connection string in `.env.local`

### Getting Help

If you encounter issues:

1. **Check the logs** - The migration script provides detailed error messages
2. **Verify your data** - Ensure your Google Sheets has the expected format
3. **Review the backup** - If you created a backup, you can restore from it

## 📈 Post-Migration

After successful migration:

1. **Test the Dashboard** - Verify all data appears correctly
2. **Check Analytics** - Review charts and summaries
3. **Start Using the System** - Begin entering new data through the forms

## 🔄 Re-running Migration

If you need to re-run the migration:

1. **Clear existing data** (if needed):
   ```bash
   # This will clear all data - use with caution!
   cd backend && npx prisma db push --force-reset
   ```

2. **Run migration again**:
   ```bash
   npm run migrate
   ```

## 🎉 Success!

Once migration is complete, you'll see a summary like:

```
📊 Migration Summary:
==================================================
💰 Revenue: 150/150 (0 errors)
💸 Expenses: 89/89 (0 errors)
👥 Salaries: 45/45 (0 errors)
==================================================
🎉 Total: 284/284 records migrated successfully!
```

Your data is now ready to use in the new dashboard system! 🚀
