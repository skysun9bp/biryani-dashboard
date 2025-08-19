const { google } = require('googleapis');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

// Google Sheets configuration
const SPREADSHEET_ID = process.env.VITE_SPREADSHEET_ID;
const API_KEY = process.env.VITE_GOOGLE_SHEETS_API_KEY;

const sheets = google.sheets({ version: 'v4', auth: API_KEY });

async function updateCCFees() {
  try {
    console.log('🔄 Updating ccFees from Google Sheets...');

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
    console.log('📋 Headers:', headers);

    // Find ccFees column index
    const ccFeesIndex = headers.findIndex(h => h === 'CC Fees');
    if (ccFeesIndex === -1) {
      console.log('❌ CC Fees column not found. Available columns:', headers);
      return;
    }

    console.log(`📍 CC Fees column found at index: ${ccFeesIndex}`);

    // Parse date function
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

      // Try parsing as Excel date number
      const excelDate = parseFloat(str);
      if (!isNaN(excelDate) && excelDate > 1) {
        const unixTimestamp = (excelDate - 25569) * 86400 * 1000;
        const date = new Date(unixTimestamp);
        if (!isNaN(date.getTime()) && date.getFullYear() > 1900) {
          return date;
        }
      }

      return null;
    }

    // Parse number function
    function parseNumber(value) {
      if (!value || value.toString().trim() === '') return 0;
      const num = parseFloat(value.toString().replace(/[$,]/g, ''));
      return isNaN(num) ? 0 : Math.round(num);
    }

    let updatedCount = 0;
    let totalCCFees = 0;

    for (const row of dataRows) {
      if (row.length > ccFeesIndex) {
        const dateStr = row[0]; // Assuming date is in first column
        const ccFeesValue = parseNumber(row[ccFeesIndex] || '0');
        
        if (ccFeesValue > 0) {
          const date = parseDate(dateStr);
          if (date) {
            try {
              // Update the existing entry
              const updated = await prisma.revenueEntry.updateMany({
                where: {
                  date: date,
                  month: date.toLocaleDateString('en-US', { month: 'short' }),
                  year: date.getFullYear()
                },
                data: {
                  ccFees: ccFeesValue
                }
              });

              if (updated.count > 0) {
                console.log(`✅ Updated ccFees for ${date.toDateString()}: $${ccFeesValue}`);
                updatedCount++;
                totalCCFees += ccFeesValue;
              }
            } catch (error) {
              console.error(`❌ Error updating ccFees for ${dateStr}:`, error.message);
            }
          }
        }
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`✅ Updated ${updatedCount} entries`);
    console.log(`💰 Total ccFees: $${totalCCFees}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

updateCCFees();
