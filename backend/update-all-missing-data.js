const { google } = require('googleapis');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '../.env.local' });

const prisma = new PrismaClient();

// Google Sheets configuration
const SPREADSHEET_ID = process.env.VITE_SPREADSHEET_ID;
const API_KEY = process.env.VITE_GOOGLE_SHEETS_API_KEY;

if (!SPREADSHEET_ID || !API_KEY) {
  console.error('❌ Missing Google Sheets configuration!');
  process.exit(1);
}

const sheets = google.sheets({ version: 'v4', auth: API_KEY });

async function updateAllMissingData() {
  try {
    console.log('🔍 Fetching all missing data from Google Sheets...');

    // Get all data from Net Sale sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Net Sale!A:AZ',
    });

    if (!response.data.values || response.data.values.length === 0) {
      console.log('❌ No data found in Net Sale sheet');
      return;
    }

    const headers = response.data.values[0];
    const dataRows = response.data.values.slice(1);

    // Find column indices
    const dateIndex = headers.findIndex(h => h === 'Date');
    const zelleIndex = headers.findIndex(h => h === 'Zelle');
    const ezCaterIndex = headers.findIndex(h => h === 'Ez Cater');
    const relishIndex = headers.findIndex(h => h === 'Relish');
    const waiterIndex = headers.findIndex(h => h === 'waiter.com');

    console.log(`📊 Found columns:`);
    console.log(`  Date: ${dateIndex}`);
    console.log(`  Zelle: ${zelleIndex}`);
    console.log(`  Ez Cater: ${ezCaterIndex}`);
    console.log(`  Relish: ${relishIndex}`);
    console.log(`  waiter.com: ${waiterIndex}`);

    // Parse date function
    function parseDate(dateStr) {
      if (!dateStr || dateStr.trim() === '') return null;
      
      // Try different date formats
      const dateFormats = [
        /^\d{1,2}\/\d{1,2}\/\d{4}$/, // MM/DD/YYYY
        /^\d{4}-\d{1,2}-\d{1,2}$/,   // YYYY-MM-DD
        /^\d{1,2}-\d{1,2}-\d{4}$/,   // MM-DD-YYYY
        /^\d{1,2}-\w{3}-\d{2}$/,     // DD-MMM-YY (like 23-Nov-23)
      ];

      for (const format of dateFormats) {
        if (format.test(dateStr)) {
          const date = new Date(dateStr);
          if (!isNaN(date.getTime())) {
            return date;
          }
        }
      }

      // Try parsing as Excel date number
      const excelDate = parseFloat(dateStr);
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
      if (!value) return 0;
      const num = parseFloat(value.replace(/[$,]/g, ''));
      return isNaN(num) ? 0 : num;
    }

    // Helper function to get month abbreviation
    function getMonthAbbr(date) {
      return date.toLocaleDateString('en-US', { month: 'short' });
    }

    let totalUpdates = 0;
    let totalZelle = 0;
    let totalEzCater = 0;
    let totalRelish = 0;
    let totalWaiter = 0;

    // Process each row
    for (const row of dataRows) {
      if (row.length > Math.max(dateIndex, zelleIndex, ezCaterIndex, relishIndex, waiterIndex)) {
        const dateStr = row[dateIndex];
        
        if (dateStr) {
          const date = parseDate(dateStr);
          if (date) {
            const month = getMonthAbbr(date);
            const year = date.getFullYear();
            
            // Parse values
            const zelleValue = parseNumber(row[zelleIndex] || '0');
            const ezCaterValue = parseNumber(row[ezCaterIndex] || '0');
            const relishValue = parseNumber(row[relishIndex] || '0');
            const waiterValue = parseNumber(row[waiterIndex] || '0');

            // Only update if there's actual data
            if (zelleValue > 0 || ezCaterValue > 0 || relishValue > 0 || waiterValue > 0) {
              console.log(`📅 ${date.toDateString()}: Zelle=$${zelleValue}, EzCater=$${ezCaterValue}, Relish=$${relishValue}, Waiter=$${waiterValue}`);
              
              try {
                // Update the database entry
                await prisma.revenueEntry.updateMany({
                  where: {
                    date: date,
                    month: month,
                    year: year
                  },
                  data: {
                    zelle: zelleValue,
                    ezCater: ezCaterValue,
                    relish: relishValue,
                    waiterCom: waiterValue
                  }
                });
                
                totalUpdates++;
                totalZelle += zelleValue;
                totalEzCater += ezCaterValue;
                totalRelish += relishValue;
                totalWaiter += waiterValue;
                
                console.log(`✅ Updated data for ${date.toDateString()}`);
              } catch (error) {
                console.error(`❌ Error updating data for ${date.toDateString()}:`, error.message);
              }
            }
          }
        }
      }
    }

    console.log(`\n📊 Update Summary:`);
    console.log(`Total entries updated: ${totalUpdates}`);
    console.log(`Total Zelle revenue: $${totalZelle.toFixed(2)}`);
    console.log(`Total EzCater revenue: $${totalEzCater.toFixed(2)}`);
    console.log(`Total Relish revenue: $${totalRelish.toFixed(2)}`);
    console.log(`Total Waiter.com revenue: $${totalWaiter.toFixed(2)}`);
    console.log(`Grand total: $${(totalZelle + totalEzCater + totalRelish + totalWaiter).toFixed(2)}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

updateAllMissingData();
