const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

// Google Sheets configuration
const SPREADSHEET_ID = process.env.VITE_SPREADSHEET_ID;
const API_KEY = process.env.VITE_GOOGLE_SHEETS_API_KEY;

const sheets = google.sheets({ version: 'v4', auth: API_KEY });

async function checkSheets() {
  try {
    console.log('🔍 Checking available sheets in Google Spreadsheet...');

    // Get spreadsheet metadata
    const response = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });

    const spreadsheet = response.data;
    console.log(`📊 Spreadsheet: ${spreadsheet.properties.title}`);
    console.log(`📋 Available sheets:`);
    
    spreadsheet.sheets.forEach((sheet, index) => {
      console.log(`  ${index + 1}. ${sheet.properties.title} (${sheet.properties.gridProperties.rowCount} rows x ${sheet.properties.gridProperties.columnCount} columns)`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkSheets();
