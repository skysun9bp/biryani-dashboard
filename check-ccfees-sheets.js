const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

// Google Sheets configuration
const SPREADSHEET_ID = process.env.VITE_SPREADSHEET_ID;
const API_KEY = process.env.VITE_GOOGLE_SHEETS_API_KEY;

const sheets = google.sheets({ version: 'v4', auth: API_KEY });

async function checkCCFeesFromSheets() {
  try {
    console.log('🔍 Checking ccFees (Card - Card2) from Google Sheets...');

    // Get data from Google Sheets
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Net Sale!A:Z',
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      console.log('❌ No data found in Net Sale sheet');
      return;
    }

    const headers = rows[0];
    const dataRows = rows.slice(1);

    console.log(`📊 Found ${dataRows.length} rows in Google Sheets`);

    // Find column indices
    const dateIndex = headers.findIndex(h => h === 'Date');
    const monthIndex = headers.findIndex(h => h === 'Month');
    const yearIndex = headers.findIndex(h => h === 'Year');
    const cardIndex = headers.findIndex(h => h === 'Card');
    const card2Index = headers.findIndex(h => h === 'Card2');

    console.log(`📍 Date: ${dateIndex}, Month: ${monthIndex}, Year: ${yearIndex}, Card: ${cardIndex}, Card2: ${card2Index}`);

    // Parse number function
    function parseNumber(value) {
      if (!value || value.toString().trim() === '') return 0;
      const num = parseFloat(value.toString().replace(/[$,]/g, ''));
      return isNaN(num) ? 0 : Math.round(num);
    }

    let jan2025Total = 0;
    const jan2025Rows = [];

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      if (row.length <= Math.max(cardIndex, card2Index, monthIndex, yearIndex)) continue;

      const yearVal = row[yearIndex];
      const monthVal = row[monthIndex];
      const dateStr = row[dateIndex];
      const cardValue = parseNumber(row[cardIndex] || '0');
      const card2Value = parseNumber(row[card2Index] || '0');
      const ccFeesValue = cardValue - card2Value;

      // Normalize year
      const yearNum = typeof yearVal === 'string' ? parseInt(yearVal.replace(/[^0-9]/g, ''), 10) : Number(yearVal);

      if (yearNum === 2025 && (monthVal === 'Jan' || monthVal === 'January' || monthVal === 'JAN')) {
        jan2025Rows.push({ date: dateStr || `${monthVal}-2025`, card: cardValue, card2: card2Value, ccFees: ccFeesValue });
        jan2025Total += ccFeesValue;
      }
    }

    if (jan2025Rows.length === 0) {
      console.log('\n❌ No January 2025 rows found in Net Sale sheet using Year/Month columns.');
    } else {
      console.log('\n📅 January 2025 CC Fees (Card - Card2) by day:');
      jan2025Rows.forEach(r => {
        console.log(`  ${r.date}: Card $${r.card} - Card2 $${r.card2} = CC Fees $${r.ccFees}`);
      });
      console.log(`\n✅ January 2025 total CC Fees: $${jan2025Total}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkCCFeesFromSheets();
