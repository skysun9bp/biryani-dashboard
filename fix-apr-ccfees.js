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

async function fixAprCCFees() {
	console.log('🔧 Fixing April 2024 CC Fees...');

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

	// Get problematic entries from database
	const problematicEntries = execSync(`sqlite3 ${DB_PATH} "SELECT date, card, card2, ccFees FROM revenue_entries WHERE month='Apr' AND year=2024 AND ccFees < 0 ORDER BY date;"`).toString().trim();

	console.log('📊 Problematic entries in database:');
	console.log(problematicEntries);

	// Create a map of Google Sheets data
	const sheetsData = new Map();
	for (const row of data) {
		if (row.length <= Math.max(idxDate, idxMonth, idxYear, idxCard, idxCard2)) continue;

		const dateStr = row[idxDate];
		const month = row[idxMonth];
		const year = parseInt(row[idxYear] || '0');
		const cardValue = parseNumber(row[idxCard] || '0');
		const card2Value = parseNumber(row[idxCard2] || '0');

		// Check for April 2024
		if (year === 2024 && (month === 'Apr' || month === 'April' || month === 'APR')) {
			const epochMs = parseSheetDateToEpochMsLocal(dateStr);
			if (epochMs) {
				sheetsData.set(epochMs, { card: cardValue, card2: card2Value, date: dateStr });
			}
		}
	}

	let updated = 0;
	let totalFixed = 0;

	// Fix each problematic entry
	problematicEntries.split('\n').forEach(line => {
		if (!line) return;
		const [date, card, card2, ccFees] = line.split('|');
		const epochMs = parseInt(date);
		const sheetsEntry = sheetsData.get(epochMs);

		if (sheetsEntry) {
			const correctCard2 = sheetsEntry.card2;
			const correctCCFees = sheetsEntry.card - correctCard2;
			
			if (correctCard2 !== parseInt(card2)) {
				const sql = `UPDATE revenue_entries SET card2 = ${correctCard2}, ccFees = ${correctCCFees} WHERE date = ${epochMs} AND month = 'Apr' AND year = 2024;`;
				try {
					execSync(`sqlite3 ${DB_PATH} "${sql}"`);
					updated++;
					totalFixed += (correctCCFees - parseInt(ccFees));
					console.log(`✅ Fixed ${sheetsEntry.date}: Card2 ${card2} → ${correctCard2}, CC Fees ${ccFees} → ${correctCCFees}`);
				} catch (e) {
					console.error(`❌ Failed to fix ${sheetsEntry.date}:`, e.message);
				}
			}
		} else {
			console.log(`⚠️  No Google Sheets data found for date ${date}`);
		}
	});

	console.log(`\n📊 Summary:`);
	console.log(`  Updated ${updated} entries`);
	console.log(`  Total CC Fees fixed: $${totalFixed}`);

	// Verify final total
	const finalTotal = parseInt(execSync(`sqlite3 ${DB_PATH} "SELECT COALESCE(SUM(ccFees), 0) FROM revenue_entries WHERE month='Apr' AND year=2024;"`).toString().trim());
	console.log(`  Final April 2024 CC Fees total: $${finalTotal}`);
}

fixAprCCFees().catch(e => {
	console.error('❌ Error:', e.message);
});
