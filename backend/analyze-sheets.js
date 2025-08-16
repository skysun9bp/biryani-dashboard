const { google } = require('googleapis');
require('dotenv').config();

// Google Sheets configuration
const SPREADSHEET_ID = process.env.VITE_SPREADSHEET_ID;
const API_KEY = process.env.VITE_GOOGLE_SHEETS_API_KEY;

if (!SPREADSHEET_ID || !API_KEY) {
  console.error('❌ Missing Google Sheets configuration!');
  process.exit(1);
}

// Initialize Google Sheets API
const sheets = google.sheets({ version: 'v4', auth: API_KEY });

async function analyzeSheets() {
  console.log('🔍 Analyzing Google Sheets structure...');
  console.log(`📊 Spreadsheet ID: ${SPREADSHEET_ID}`);

  try {
    // Get sheet names
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
      ranges: ['Net Sale!A1:Z1', 'Expenses!A1:Z1', 'Salaries!A1:Z1']
    });

    console.log('\n📋 Sheet Names:');
    spreadsheet.data.sheets.forEach(sheet => {
      console.log(`   - ${sheet.properties.title}`);
    });

    // Analyze each sheet
    const sheetsToAnalyze = ['Net Sale', 'Expenses', 'Salaries'];
    
    for (const sheetName of sheetsToAnalyze) {
      console.log(`\n📊 Analyzing "${sheetName}" sheet:`);
      
      try {
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId: SPREADSHEET_ID,
          range: `${sheetName}!A1:Z1`,
        });

        const headers = response.data.values?.[0] || [];
        console.log(`   Headers (${headers.length} columns):`);
        headers.forEach((header, index) => {
          console.log(`     ${index + 1}. "${header}"`);
        });

        // Get a few sample rows
        const sampleResponse = await sheets.spreadsheets.values.get({
          spreadsheetId: SPREADSHEET_ID,
          range: `${sheetName}!A2:D5`,
        });

        const sampleRows = sampleResponse.data.values || [];
        console.log(`   Sample data (first 4 rows):`);
        sampleRows.forEach((row, index) => {
          console.log(`     Row ${index + 2}: ${JSON.stringify(row)}`);
        });

      } catch (error) {
        console.error(`   ❌ Error analyzing ${sheetName}:`, error.message);
      }
    }

  } catch (error) {
    console.error('❌ Error analyzing sheets:', error);
  }
}

analyzeSheets().catch(console.error);
