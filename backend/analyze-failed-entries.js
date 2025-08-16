const { google } = require('googleapis');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

// Google Sheets configuration
const SPREADSHEET_ID = process.env.VITE_SPREADSHEET_ID;
const API_KEY = process.env.VITE_GOOGLE_SHEETS_API_KEY;

if (!SPREADSHEET_ID || !API_KEY) {
  console.error('❌ Missing Google Sheets configuration!');
  process.exit(1);
}

// Initialize Google Sheets API
const sheets = google.sheets({ version: 'v4', auth: API_KEY });

// Enhanced date parsing function (same as migration script)
function parseDate(dateStr) {
  if (!dateStr || dateStr.toString().trim() === '') return null;
  
  const str = dateStr.toString().trim();
  
  // Handle DD-MMM-YY format (e.g., "23-Nov-23")
  const ddMmmYyMatch = str.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{2})$/);
  if (ddMmmYyMatch) {
    const [, day, month, year] = ddMmmYyMatch;
    const fullYear = parseInt(year) < 50 ? `20${year}` : `19${year}`;
    const date = new Date(`${month} ${day}, ${fullYear}`);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  // Handle DD/MM/YYYY format (e.g., "6/30/2025")
  const ddSlashMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (ddSlashMatch) {
    const [, month, day, year] = ddSlashMatch;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  // Try different date formats
  const dateFormats = [
    /^\d{1,2}\/\d{1,2}\/\d{4}$/, // MM/DD/YYYY
    /^\d{4}-\d{1,2}-\d{1,2}$/,   // YYYY-MM-DD
    /^\d{1,2}-\d{1,2}-\d{4}$/,   // MM-DD-YYYY
  ];
  
  for (const format of dateFormats) {
    if (format.test(str)) {
      const date = new Date(str);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
  }

  // Fallback to direct Date constructor
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
  const num = parseFloat(value.toString().replace(/[^\d.-]/g, ''));
  return isNaN(num) ? 0 : num;
}

// Helper function to get month abbreviation
function getMonthAbbr(date) {
  return date.toLocaleDateString('en-US', { month: 'short' });
}

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

// Analyze Revenue Data
async function analyzeRevenueData() {
  console.log('\n💰 Analyzing Revenue Data...');
  const revenueData = await fetchSheetData('Net Sale');
  const failedEntries = [];

  for (const row of revenueData) {
    const date = parseDate(row['Date']);
    if (!date) {
      failedEntries.push({
        type: 'Revenue',
        date: row['Date'],
        reason: 'Invalid date format',
        row: row
      });
      continue;
    }

    // Check if entry exists in database
    const existingEntry = await prisma.revenueEntry.findFirst({
      where: {
        date: date.toISOString(),
        month: getMonthAbbr(date),
        year: date.getFullYear()
      }
    });

    if (!existingEntry) {
      failedEntries.push({
        type: 'Revenue',
        date: row['Date'],
        reason: 'Not found in database',
        row: row
      });
    }
  }

  return failedEntries;
}

// Analyze Expense Data
async function analyzeExpenseData() {
  console.log('\n💸 Analyzing Expense Data...');
  const expenseData = await fetchSheetData('Expenses');
  const failedEntries = [];

  for (const row of expenseData) {
    const date = parseDate(row['Date']);
    if (!date) {
      failedEntries.push({
        type: 'Expense',
        date: row['Date'],
        reason: 'Invalid date format',
        row: row
      });
      continue;
    }

    const amount = parseNumber(row['Amount']);
    if (amount === 0) {
      failedEntries.push({
        type: 'Expense',
        date: row['Date'],
        reason: 'Invalid amount',
        row: row
      });
      continue;
    }

    // Check if entry exists in database
    const existingEntry = await prisma.expenseEntry.findFirst({
      where: {
        date: date.toISOString(),
        month: getMonthAbbr(date),
        year: date.getFullYear(),
        costType: row['Cost Type'] || '',
        amount: amount
      }
    });

    if (!existingEntry) {
      failedEntries.push({
        type: 'Expense',
        date: row['Date'],
        reason: 'Not found in database',
        row: row
      });
    }
  }

  return failedEntries;
}

// Analyze Salary Data
async function analyzeSalaryData() {
  console.log('\n👥 Analyzing Salary Data...');
  const salaryData = await fetchSheetData('Salaries');
  const failedEntries = [];

  for (const row of salaryData) {
    // Skip empty rows
    if (!row['Resource Name'] || !row['Pay Period'] || !row['Amount']) {
      failedEntries.push({
        type: 'Salary',
        date: row['Pay Period'] || 'N/A',
        reason: 'Empty required fields',
        row: row
      });
      continue;
    }

    const date = parseDate(row['Pay Period']);
    if (!date) {
      failedEntries.push({
        type: 'Salary',
        date: row['Pay Period'],
        reason: 'Invalid date format',
        row: row
      });
      continue;
    }

    const amount = parseNumber(row['Amount']);
    if (amount === 0) {
      failedEntries.push({
        type: 'Salary',
        date: row['Pay Period'],
        reason: 'Invalid amount',
        row: row
      });
      continue;
    }

    // Check if entry exists in database
    const existingEntry = await prisma.salaryEntry.findFirst({
      where: {
        date: date.toISOString(),
        month: getMonthAbbr(date),
        year: date.getFullYear(),
        resourceName: row['Resource Name'],
        amount: amount
      }
    });

    if (!existingEntry) {
      failedEntries.push({
        type: 'Salary',
        date: row['Pay Period'],
        reason: 'Not found in database',
        row: row
      });
    }
  }

  return failedEntries;
}

// Main analysis function
async function analyzeFailedEntries() {
  try {
    console.log('🔍 Analyzing failed entries from migration...\n');

    const revenueFailed = await analyzeRevenueData();
    const expenseFailed = await analyzeExpenseData();
    const salaryFailed = await analyzeSalaryData();

    const allFailed = [...revenueFailed, ...expenseFailed, ...salaryFailed];

    console.log('\n📊 FAILED ENTRIES ANALYSIS');
    console.log('==================================================');
    console.log(`💰 Revenue: ${revenueFailed.length} failed entries`);
    console.log(`💸 Expenses: ${expenseFailed.length} failed entries`);
    console.log(`👥 Salaries: ${salaryFailed.length} failed entries`);
    console.log(`📋 Total: ${allFailed.length} failed entries`);
    console.log('==================================================\n');

    if (allFailed.length === 0) {
      console.log('✅ All entries were successfully migrated!');
      return;
    }

    console.log('📝 DETAILED FAILED ENTRIES:');
    console.log('==================================================\n');

    allFailed.forEach((entry, index) => {
      console.log(`${index + 1}. ${entry.type} Entry`);
      console.log(`   Date: ${entry.date}`);
      console.log(`   Reason: ${entry.reason}`);
      console.log(`   Data: ${JSON.stringify(entry.row, null, 2)}`);
      console.log('');
    });

    console.log('💡 MANUAL ENTRY INSTRUCTIONS:');
    console.log('==================================================');
    console.log('1. Go to your dashboard at http://localhost:5173');
    console.log('2. Navigate to "Data Entry" tab');
    console.log('3. Use the forms to manually enter the failed entries above');
    console.log('4. Pay special attention to date formats and required fields');
    console.log('==================================================');

  } catch (error) {
    console.error('❌ Analysis failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the analysis
analyzeFailedEntries();
