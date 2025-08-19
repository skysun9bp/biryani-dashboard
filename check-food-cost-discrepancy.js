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

function parseSheetDateToEpochMsLocal(dateStr) {
	if (!dateStr) return null;
	const str = dateStr.toString().trim();
	const m = str.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{2})$/);
	if (!m) return null;
	const day = parseInt(m[1], 10);
	const monStr = m[2].toLowerCase();
	const yy = parseInt(m[3], 10);
	const year = yy < 50 ? 2000 + yy : 1900 + yy;
	const months = { jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11 };
	const monIdx = months[monStr];
	if (monIdx == null) return null;
	return new Date(year, monIdx, day).getTime();
}

async function checkFoodCostDiscrepancy() {
	console.log('🔍 Checking food cost discrepancies for Sep/Oct 2024...');

	// Get data from Google Sheets
	const res = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: 'Expenses!A:Z' });
	const rows = res.data.values || [];
	if (rows.length === 0) {
		console.error('❌ No data in Expenses sheet');
		return;
	}
	const headers = rows[0];
	const data = rows.slice(1);

	const idxDate = headers.indexOf('Date');
	const idxCostType = headers.indexOf('Cost Type');
	const idxAmount = headers.indexOf('Amount');
	const idxYear = headers.indexOf('Year');
	const idxMonth = headers.indexOf('Month');

	console.log(`📍 Headers found: Date=${idxDate}, Cost Type=${idxCostType}, Amount=${idxAmount}, Year=${idxYear}, Month=${idxMonth}`);

	// Check database totals
	const dbSepTotal = parseInt(execSync(`sqlite3 ${DB_PATH} "SELECT COALESCE(SUM(amount), 0) FROM expense_entries WHERE month='Sep' AND year=2024 AND costType='Food costs';"`).toString().trim());
	const dbOctTotal = parseInt(execSync(`sqlite3 ${DB_PATH} "SELECT COALESCE(SUM(amount), 0) FROM expense_entries WHERE month='Oct' AND year=2024 AND costType='Food costs';"`).toString().trim());

	console.log(`\n📊 Database totals:`);
	console.log(`  Sep 2024: $${dbSepTotal}`);
	console.log(`  Oct 2024: $${dbOctTotal}`);

	// Calculate Google Sheets totals
	let sheetsSepTotal = 0;
	let sheetsOctTotal = 0;
	const sepEntries = [];
	const octEntries = [];

	for (const row of data) {
		if (row.length <= Math.max(idxDate, idxCostType, idxAmount, idxYear, idxMonth)) continue;

		const dateStr = row[idxDate];
		const costType = row[idxCostType];
		const amount = parseNumber(row[idxAmount]);
		const year = parseInt(row[idxYear] || '0');
		const month = row[idxMonth];

		// Check for food cost entries
		if (costType && costType.toString().toLowerCase().includes('food') && amount > 0) {
			if (year === 2024) {
				if (month === 'Sep' || month === 'September' || month === 'SEP') {
					sheetsSepTotal += amount;
					sepEntries.push({ date: dateStr, amount, costType });
				} else if (month === 'Oct' || month === 'October' || month === 'OCT') {
					sheetsOctTotal += amount;
					octEntries.push({ date: dateStr, amount, costType });
				}
			}
		}
	}

	console.log(`\n📊 Google Sheets totals:`);
	console.log(`  Sep 2024: $${sheetsSepTotal}`);
	console.log(`  Oct 2024: $${sheetsOctTotal}`);

	console.log(`\n📊 Discrepancies:`);
	console.log(`  Sep 2024: Sheets $${sheetsSepTotal} - DB $${dbSepTotal} = $${sheetsSepTotal - dbSepTotal}`);
	console.log(`  Oct 2024: Sheets $${sheetsOctTotal} - DB $${dbOctTotal} = $${sheetsOctTotal - dbOctTotal}`);

	// Show detailed entries for September
	if (sepEntries.length > 0) {
		console.log(`\n📅 September 2024 food cost entries from Google Sheets:`);
		sepEntries.forEach(entry => {
			console.log(`  ${entry.date}: $${entry.amount} (${entry.costType})`);
		});
	}

	// Show detailed entries for October
	if (octEntries.length > 0) {
		console.log(`\n📅 October 2024 food cost entries from Google Sheets:`);
		octEntries.forEach(entry => {
			console.log(`  ${entry.date}: $${entry.amount} (${entry.costType})`);
		});
	}

	// Check database entries
	const dbSepEntries = execSync(`sqlite3 ${DB_PATH} "SELECT date, amount, costType FROM expense_entries WHERE month='Sep' AND year=2024 AND costType='Food costs' ORDER BY date;"`).toString().trim();
	const dbOctEntries = execSync(`sqlite3 ${DB_PATH} "SELECT date, amount, costType FROM expense_entries WHERE month='Oct' AND year=2024 AND costType='Food costs' ORDER BY date;"`).toString().trim();

	console.log(`\n📅 September 2024 food cost entries from Database:`);
	console.log(dbSepEntries || '  No entries found');

	console.log(`\n📅 October 2024 food cost entries from Database:`);
	console.log(dbOctEntries || '  No entries found');
}

checkFoodCostDiscrepancy().catch(e => {
	console.error('❌ Error:', e.message);
});
