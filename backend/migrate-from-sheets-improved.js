const { google } = require('googleapis');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

// Google Sheets configuration
const SPREADSHEET_ID = process.env.VITE_SPREADSHEET_ID;
const API_KEY = process.env.VITE_GOOGLE_SHEETS_API_KEY;

if (!SPREADSHEET_ID || !API_KEY) {
  console.error('❌ Missing Google Sheets configuration!');
  console.error('Please set VITE_SPREADSHEET_ID and VITE_GOOGLE_SHEETS_API_KEY in .env');
  process.exit(1);
}

// Initialize Google Sheets API
const sheets = google.sheets({ version: 'v4', auth: API_KEY });

const stats = {
  revenue: { total: 0, success: 0, errors: 0 },
  expenses: { total: 0, success: 0, errors: 0 },
  salaries: { total: 0, success: 0, errors: 0 }
};

// Helper function to fetch sheet data
async function fetchSheetData(sheetName) {
  try {
    console.log(`📥 Fetching data from "${sheetName}" sheet...`);
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A:Z`,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      console.log(`⚠️  No data found in "${sheetName}" sheet`);
      return [];
    }

    // Convert to objects with headers
    const headers = rows[0];
    const data = rows.slice(1).map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || '';
      });
      return obj;
    });

    console.log(`✅ Fetched ${data.length} rows from "${sheetName}" sheet`);
    return data;
  } catch (error) {
    console.error(`❌ Error fetching data from "${sheetName}" sheet:`, error);
    return [];
  }
}

// Enhanced date parsing function
function parseDate(dateStr) {
  if (!dateStr || dateStr.toString().trim() === '') return null;
  
  const str = dateStr.toString().trim();
  
  // Try different date formats
  const dateFormats = [
    /^\d{1,2}\/\d{1,2}\/\d{4}$/, // MM/DD/YYYY
    /^\d{4}-\d{1,2}-\d{1,2}$/,   // YYYY-MM-DD
    /^\d{1,2}-\d{1,2}-\d{4}$/,   // MM-DD-YYYY
    /^\d{1,2}\/\d{1,2}\/\d{2}$/, // MM/DD/YY
    /^\d{1,2}-\d{1,2}-\d{2}$/,   // MM-DD-YY
  ];

  for (const format of dateFormats) {
    if (format.test(str)) {
      const date = new Date(str);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
  }

  // Try parsing as Excel date number
  const excelDate = parseFloat(str);
  if (!isNaN(excelDate) && excelDate > 1) {
    // Excel dates are days since 1900-01-01
    const date = new Date((excelDate - 25569) * 86400 * 1000);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  // Try parsing with Date constructor directly
  const directDate = new Date(str);
  if (!isNaN(directDate.getTime())) {
    return directDate;
  }

  console.warn(`⚠️  Could not parse date: "${str}"`);
  return null;
}

// Helper function to parse number
function parseNumber(value) {
  if (!value || value.toString().trim() === '') return 0;
  const num = parseFloat(value.toString().replace(/[$,]/g, ''));
  return isNaN(num) ? 0 : num;
}

// Helper function to get month abbreviation
function getMonthAbbr(date) {
  return date.toLocaleDateString('en-US', { month: 'short' });
}

// Migrate Revenue Data
async function migrateRevenueData() {
  console.log('\n💰 Starting Revenue Data Migration...');
  
  const revenueData = await fetchSheetData('Net Sale');
  if (revenueData.length === 0) return;

  stats.revenue.total = revenueData.length;

  for (const row of revenueData) {
    try {
      // Try multiple date fields
      const date = parseDate(row['Column 1'] || row['Date'] || row['Date '] || row['DATE']);
      if (!date) {
        console.warn(`⚠️  Skipping revenue row with invalid date: ${JSON.stringify(row)}`);
        stats.revenue.errors++;
        continue;
      }

      // Check if entry already exists
      const existingEntry = await prisma.revenueEntry.findFirst({
        where: {
          date: date,
          year: date.getFullYear(),
          month: getMonthAbbr(date)
        }
      });

      if (existingEntry) {
        console.log(`⏭️  Skipping existing revenue entry for ${date.toDateString()}`);
        continue;
      }

      // Create revenue entry with all possible field mappings
      const revenueEntry = await prisma.revenueEntry.create({
        data: {
          date: date,
          month: getMonthAbbr(date),
          year: date.getFullYear(),
          cashInReport: parseNumber(row['Cash in Report'] || row['Cash In Report'] || '0'),
          card: parseNumber(row['Card'] || '0'),
          dd: parseNumber(row['DD'] || '0'),
          ue: parseNumber(row['UE'] || '0'),
          gh: parseNumber(row['GH'] || '0'),
          cn: parseNumber(row['CN'] || '0'),
          catering: parseNumber(row['Catering'] || '0'),
          otherCash: parseNumber(row['Other Cash'] || row['Other cash'] || '0'),
          foodja: parseNumber(row['Foodja'] || '0'),
          zelle: parseNumber(row['Zelle'] || '0'),
          ezCater: parseNumber(row['Ez Cater'] || row['EzCater'] || '0'),
          relish: parseNumber(row['Relish'] || '0'),
          waiterCom: parseNumber(row['waiter.com'] || row['Waiter.com'] || '0'),
          ccFees: parseNumber(row['CC Fees'] || row['CC fees'] || '0'),
          ddFees: parseNumber(row['DD Fees'] || row['DD fees'] || '0'),
          ueFees: parseNumber(row['UE Fees'] || row['UE fees'] || '0'),
          ghFees: parseNumber(row['GH Fees'] || row['GH fees'] || '0'),
          foodjaFees: parseNumber(row['Foodja Fees'] || row['Foodja fees'] || '0'),
          ezCaterFees: parseNumber(row['EzCater Fees'] || row['EzCater fees'] || '0'),
          relishFees: parseNumber(row['Relish Fees'] || row['Relish fees'] || '0'),
          createdBy: 1 // Default to admin user
        }
      });

      console.log(`✅ Migrated revenue entry for ${date.toDateString()}`);
      stats.revenue.success++;
    } catch (error) {
      console.error(`❌ Error migrating revenue entry:`, error);
      stats.revenue.errors++;
    }
  }
}

// Migrate Expense Data
async function migrateExpenseData() {
  console.log('\n💸 Starting Expense Data Migration...');
  
  const expenseData = await fetchSheetData('Expenses');
  if (expenseData.length === 0) return;

  stats.expenses.total = expenseData.length;

  for (const row of expenseData) {
    try {
      // Try multiple date fields
      const date = parseDate(row['Date'] || row['DATE'] || row['Date ']);
      if (!date) {
        console.warn(`⚠️  Skipping expense row with invalid date: ${JSON.stringify(row)}`);
        stats.expenses.errors++;
        continue;
      }

      // Check if entry already exists
      const existingEntry = await prisma.expenseEntry.findFirst({
        where: {
          date: date,
          year: date.getFullYear(),
          month: getMonthAbbr(date),
          costType: row['Cost Type'] || row['Cost type'] || '',
          amount: parseNumber(row['Amount'] || '0')
        }
      });

      if (existingEntry) {
        console.log(`⏭️  Skipping existing expense entry for ${date.toDateString()}`);
        continue;
      }

      // Create expense entry
      const expenseEntry = await prisma.expenseEntry.create({
        data: {
          date: date,
          month: getMonthAbbr(date),
          year: date.getFullYear(),
          costType: row['Cost Type'] || row['Cost type'] || 'Other',
          expenseType: row['Expense Type'] || row['Expense type'] || null,
          itemVendor: row['Item (Vendor)'] || row['Item(Vendor)'] || row['Item Vendor'] || null,
          amount: parseNumber(row['Amount'] || '0'),
          createdBy: 1 // Default to admin user
        }
      });

      console.log(`✅ Migrated expense entry for ${date.toDateString()}`);
      stats.expenses.success++;
    } catch (error) {
      console.error(`❌ Error migrating expense entry:`, error);
      stats.expenses.errors++;
    }
  }
}

// Migrate Salary Data with improved date handling
async function migrateSalaryData() {
  console.log('\n👥 Starting Salary Data Migration...');
  
  const salaryData = await fetchSheetData('Salaries');
  if (salaryData.length === 0) return;

  stats.salaries.total = salaryData.length;

  for (const row of salaryData) {
    try {
      // Try multiple date fields - salary sheet uses "Pay Period" instead of "Date"
      const date = parseDate(row['Pay Period'] || row['Date'] || row['DATE'] || row['Pay period']);
      if (!date) {
        console.warn(`⚠️  Skipping salary row with invalid date: ${JSON.stringify(row)}`);
        stats.salaries.errors++;
        continue;
      }

      // Parse actual paid date
      const actualPaidDate = parseDate(row['Actual Paid Date'] || row['Actual paid date'] || row['Actual Paid Date ']);

      // Check if entry already exists
      const existingEntry = await prisma.salaryEntry.findFirst({
        where: {
          date: date,
          year: date.getFullYear(),
          month: getMonthAbbr(date),
          resourceName: row['Resource Name'] || row['Resource name'] || '',
          amount: parseNumber(row['Amount'] || '0')
        }
      });

      if (existingEntry) {
        console.log(`⏭️  Skipping existing salary entry for ${date.toDateString()}`);
        continue;
      }

      // Create salary entry
      const salaryEntry = await prisma.salaryEntry.create({
        data: {
          date: date,
          month: getMonthAbbr(date),
          year: date.getFullYear(),
          resourceName: row['Resource Name'] || row['Resource name'] || 'Unknown Employee',
          amount: parseNumber(row['Amount'] || '0'),
          actualPaidDate: actualPaidDate,
          createdBy: 1 // Default to admin user
        }
      });

      console.log(`✅ Migrated salary entry for ${date.toDateString()}`);
      stats.salaries.success++;
    } catch (error) {
      console.error(`❌ Error migrating salary entry:`, error);
      stats.salaries.errors++;
    }
  }
}

// Main migration function
async function runMigration() {
  console.log('🚀 Starting Google Sheets to Database Migration (Improved Version)...');
  console.log(`📊 Source: ${SPREADSHEET_ID}`);
  console.log(`🗄️  Target: Database`);

  try {
    // Test Google Sheets connection
    console.log('\n🔗 Testing Google Sheets connection...');
    const testResponse = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
      ranges: ['Net Sale!A1:A1']
    });
    console.log('✅ Google Sheets connection successful');

    // Run migrations
    await migrateRevenueData();
    await migrateExpenseData();
    await migrateSalaryData();

    // Print summary
    console.log('\n📊 Migration Summary:');
    console.log('='.repeat(50));
    console.log(`💰 Revenue: ${stats.revenue.success}/${stats.revenue.total} (${stats.revenue.errors} errors)`);
    console.log(`💸 Expenses: ${stats.expenses.success}/${stats.expenses.total} (${stats.expenses.errors} errors)`);
    console.log(`👥 Salaries: ${stats.salaries.success}/${stats.salaries.total} (${stats.salaries.errors} errors)`);
    
    const totalSuccess = stats.revenue.success + stats.expenses.success + stats.salaries.success;
    const totalRecords = stats.revenue.total + stats.expenses.total + stats.salaries.total;
    
    console.log('='.repeat(50));
    console.log(`🎉 Total: ${totalSuccess}/${totalRecords} records migrated successfully!`);

    if (totalSuccess > 0) {
      console.log('\n✅ Migration completed successfully!');
      console.log('🌐 You can now use the dashboard with your migrated data.');
      
      // Calculate success percentage
      const successRate = ((totalSuccess / totalRecords) * 100).toFixed(1);
      console.log(`📈 Success Rate: ${successRate}%`);
      
      if (successRate < 90) {
        console.log('\n⚠️  Some records failed to migrate. Check the logs above for details.');
      }
    } else {
      console.log('\n⚠️  No data was migrated. Please check your Google Sheets configuration.');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Export the runMigration function for use in other scripts
module.exports = { runMigration };

// Run the migration if this file is executed directly
if (require.main === module) {
  runMigration().catch(console.error);
}
