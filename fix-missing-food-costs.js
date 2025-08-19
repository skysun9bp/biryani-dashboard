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

function getMonthAbbr(monthStr) {
	const monthMap = {
		'Sep': 'Sep', 'September': 'Sep', 'SEP': 'Sep',
		'Oct': 'Oct', 'October': 'Oct', 'OCT': 'Oct'
	};
	return monthMap[monthStr] || monthStr;
}

async function fixMissingFoodCosts() {
	console.log('🔧 Fixing missing food cost entries for Sep/Oct 2024...');

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

	// Get existing database entries
	const dbSepEntries = execSync(`sqlite3 ${DB_PATH} "SELECT date, amount FROM expense_entries WHERE month='Sep' AND year=2024 AND costType='Food costs';"`).toString().trim();
	const dbOctEntries = execSync(`sqlite3 ${DB_PATH} "SELECT date, amount FROM expense_entries WHERE month='Oct' AND year=2024 AND costType='Food costs';"`).toString().trim();

	// Parse existing entries into a set for quick lookup
	const existingSepEntries = new Set();
	const existingOctEntries = new Set();

	dbSepEntries.split('\n').forEach(line => {
		if (line) {
			const [date, amount] = line.split('|');
			existingSepEntries.add(`${date}|${amount}`);
		}
	});

	dbOctEntries.split('\n').forEach(line => {
		if (line) {
			const [date, amount] = line.split('|');
			existingOctEntries.add(`${date}|${amount}`);
		}
	});

	let addedSep = 0;
	let addedOct = 0;
	let totalAddedSep = 0;
	let totalAddedOct = 0;
	const now = Date.now();

	for (const row of data) {
		if (row.length <= Math.max(idxDate, idxCostType, idxAmount, idxYear, idxMonth)) continue;

		const dateStr = row[idxDate];
		const costType = row[idxCostType];
		const amount = parseNumber(row[idxAmount]);
		const year = parseInt(row[idxYear] || '0');
		const month = row[idxMonth];

		// Check for food cost entries
		if (costType && costType.toString().toLowerCase().includes('food') && amount > 0 && year === 2024) {
			const monthAbbr = getMonthAbbr(month);
			const epochMs = parseSheetDateToEpochMsLocal(dateStr);
			
			if (!epochMs) continue;

			const entryKey = `${epochMs}|${amount}`;
			let shouldAdd = false;

			if (monthAbbr === 'Sep' && !existingSepEntries.has(entryKey)) {
				shouldAdd = true;
				existingSepEntries.add(entryKey);
			} else if (monthAbbr === 'Oct' && !existingOctEntries.has(entryKey)) {
				shouldAdd = true;
				existingOctEntries.add(entryKey);
			}

			if (shouldAdd) {
				const sql = `INSERT INTO expense_entries (date, month, year, costType, amount, createdBy, createdAt, updatedAt) VALUES (${epochMs}, '${monthAbbr}', 2024, 'Food costs', ${amount}, 1, ${now}, ${now});`;
				try {
					execSync(`sqlite3 ${DB_PATH} "${sql}"`);
					if (monthAbbr === 'Sep') {
						addedSep++;
						totalAddedSep += amount;
						console.log(`✅ Added Sep: ${dateStr} - $${amount}`);
					} else {
						addedOct++;
						totalAddedOct += amount;
						console.log(`✅ Added Oct: ${dateStr} - $${amount}`);
					}
				} catch (e) {
					console.error(`❌ Failed to add ${dateStr}:`, e.message);
				}
			}
		}
	}

	console.log(`\n📊 Summary:`);
	console.log(`  September 2024: Added ${addedSep} entries, total $${totalAddedSep}`);
	console.log(`  October 2024: Added ${addedOct} entries, total $${totalAddedOct}`);

	// Verify totals
	const newSepTotal = parseInt(execSync(`sqlite3 ${DB_PATH} "SELECT COALESCE(SUM(amount), 0) FROM expense_entries WHERE month='Sep' AND year=2024 AND costType='Food costs';"`).toString().trim());
	const newOctTotal = parseInt(execSync(`sqlite3 ${DB_PATH} "SELECT COALESCE(SUM(amount), 0) FROM expense_entries WHERE month='Oct' AND year=2024 AND costType='Food costs';"`).toString().trim());

	console.log(`\n📊 New totals:`);
	console.log(`  Sep 2024: $${newSepTotal}`);
	console.log(`  Oct 2024: $${newOctTotal}`);
}

fixMissingFoodCosts().catch(e => {
	console.error('❌ Error:', e.message);
});
