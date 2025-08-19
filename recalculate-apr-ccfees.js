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

async function recalculateAprCCFees() {
	console.log('🔄 Recalculating April 2024 CC Fees from Google Sheets...');

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

	let updated = 0;
	let totalCCFees = 0;

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
				// Calculate CC Fees as Card - Card2, but only if positive
				const ccFeesValue = Math.max(0, cardValue - card2Value);
				
				const sql = `UPDATE revenue_entries SET ccFees = ${ccFeesValue} WHERE date = ${epochMs} AND month = 'Apr' AND year = 2024;`;
				try {
					execSync(`sqlite3 ${DB_PATH} "${sql}"`);
					updated++;
					totalCCFees += ccFeesValue;
					console.log(`✅ Updated ${dateStr}: Card $${cardValue} - Card2 $${card2Value} = CC Fees $${ccFeesValue}`);
				} catch (e) {
					console.error(`❌ Failed to update ${dateStr}:`, e.message);
				}
			}
		}
	}

	console.log(`\n📊 Summary:`);
	console.log(`  Updated ${updated} entries`);
	console.log(`  Total April 2024 CC Fees: $${totalCCFees}`);

	// Verify final total
	const finalTotal = parseInt(execSync(`sqlite3 ${DB_PATH} "SELECT COALESCE(SUM(ccFees), 0) FROM revenue_entries WHERE month='Apr' AND year=2024;"`).toString().trim());
	console.log(`  Final database total: $${finalTotal}`);
}

recalculateAprCCFees().catch(e => {
	console.error('❌ Error:', e.message);
});
