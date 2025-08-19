const { google } = require('googleapis');
const { execSync } = require('child_process');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const DB_PATH = path.resolve('backend/prisma/dev.db');
const SPREADSHEET_ID = process.env.VITE_SPREADSHEET_ID;
const API_KEY = process.env.VITE_GOOGLE_SHEETS_API_KEY;

const sheets = google.sheets({ version: 'v4', auth: API_KEY });

function parseNumber(value) {
	if (!value || value.toString().trim() === '') return 0;
	const num = parseFloat(value.toString().replace(/[$,]/g, ''));
	return isNaN(num) ? 0 : Math.round(num);
}

async function checkCCFeesApr2024() {
	console.log('🔍 Checking CC Fees for April 2024...');

	// Get data from Google Sheets
	const res = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: 'Net Sale!A:Z' });
	const rows = res.data.values || [];
	if (rows.length === 0) {
		console.error('❌ No data in Net Sale sheet');
		return;
	}
	const headers = rows[0];
	const data = rows.slice(1);

	const idxDate = headers.indexOf('Date');
	const idxMonth = headers.indexOf('Month');
	const idxYear = headers.indexOf('Year');
	const idxCard = headers.indexOf('Card');
	const idxCard2 = headers.indexOf('Card2');

	console.log(`📍 Headers found: Date=${idxDate}, Month=${idxMonth}, Year=${idxYear}, Card=${idxCard}, Card2=${idxCard2}`);

	// Check database total
	const dbAprTotal = parseInt(execSync(`sqlite3 ${DB_PATH} "SELECT COALESCE(SUM(ccFees), 0) FROM revenue_entries WHERE month='Apr' AND year=2024;"`).toString().trim());

	console.log(`\n📊 Database total for April 2024: $${dbAprTotal}`);

	// Calculate Google Sheets total
	let sheetsAprTotal = 0;
	const aprEntries = [];

	for (const row of data) {
		if (row.length <= Math.max(idxDate, idxMonth, idxYear, idxCard, idxCard2)) continue;

		const dateStr = row[idxDate];
		const month = row[idxMonth];
		const year = parseInt(row[idxYear] || '0');
		const cardValue = parseNumber(row[idxCard] || '0');
		const card2Value = parseNumber(row[idxCard2] || '0');
		const ccFeesValue = cardValue - card2Value;

		// Check for April 2024
		if (year === 2024 && (month === 'Apr' || month === 'April' || month === 'APR')) {
			if (ccFeesValue > 0) {
				sheetsAprTotal += ccFeesValue;
				aprEntries.push({
					date: dateStr,
					card: cardValue,
					card2: card2Value,
					ccFees: ccFeesValue
				});
			}
		}
	}

	console.log(`📊 Google Sheets total for April 2024: $${sheetsAprTotal}`);
	console.log(`📊 Discrepancy: Sheets $${sheetsAprTotal} - DB $${dbAprTotal} = $${sheetsAprTotal - dbAprTotal}`);

	// Show detailed entries
	if (aprEntries.length > 0) {
		console.log(`\n📅 April 2024 CC Fees entries from Google Sheets:`);
		aprEntries.forEach(entry => {
			console.log(`  ${entry.date}: Card $${entry.card} - Card2 $${entry.card2} = CC Fees $${entry.ccFees}`);
		});
	}

	// Check database entries
	const dbAprEntries = execSync(`sqlite3 ${DB_PATH} "SELECT date, ccFees FROM revenue_entries WHERE month='Apr' AND year=2024 AND ccFees > 0 ORDER BY date;"`).toString().trim();

	console.log(`\n📅 April 2024 CC Fees entries from Database:`);
	console.log(dbAprEntries || '  No entries found');

	// Check if there are any negative CC fees in database
	const dbAprNegative = execSync(`sqlite3 ${DB_PATH} "SELECT date, ccFees FROM revenue_entries WHERE month='Apr' AND year=2024 AND ccFees < 0 ORDER BY date;"`).toString().trim();

	if (dbAprNegative) {
		console.log(`\n📅 April 2024 negative CC Fees entries from Database:`);
		console.log(dbAprNegative);
	}
}

checkCCFeesApr2024().catch(e => {
	console.error('❌ Error:', e.message);
});
