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
	// Local midnight epoch (matches how rows were inserted)
	return new Date(year, monIdx, day).getTime();
}

function getMonthAbbr(monthStr) {
	const monthMap = {
		'Jan': 'Jan', 'January': 'Jan', 'JAN': 'Jan',
		'Feb': 'Feb', 'February': 'Feb', 'FEB': 'Feb',
		'Mar': 'Mar', 'March': 'Mar', 'MAR': 'Mar',
		'Apr': 'Apr', 'April': 'Apr', 'APR': 'Apr',
		'May': 'May', 'MAY': 'May',
		'Jun': 'Jun', 'June': 'Jun', 'JUN': 'Jun',
		'Jul': 'Jul', 'July': 'Jul', 'JUL': 'Jul',
		'Aug': 'Aug', 'August': 'Aug', 'AUG': 'Aug',
		'Sep': 'Sep', 'September': 'Sep', 'SEP': 'Sep',
		'Oct': 'Oct', 'October': 'Oct', 'OCT': 'Oct',
		'Nov': 'Nov', 'November': 'Nov', 'NOV': 'Nov',
		'Dec': 'Dec', 'December': 'Dec', 'DEC': 'Dec'
	};
	return monthMap[monthStr] || monthStr;
}

async function run() {
	console.log('🔄 Updating revenue_entries.ccFees for ALL months from Net Sale (Card - Card2)...');
	const res = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: 'Net Sale!A:Z' });
	const rows = res.data.values || [];
	if (rows.length === 0) {
		console.error('❌ No data in Net Sale');
		return;
	}
	const headers = rows[0];
	const data = rows.slice(1);

	const idxDate = headers.indexOf('Date');
	const idxMonth = headers.indexOf('Month');
	const idxYear = headers.indexOf('Year');
	const idxCard = headers.indexOf('Card');
	const idxCard2 = headers.indexOf('Card2');
	if (idxDate === -1 || idxMonth === -1 || idxYear === -1 || idxCard === -1 || idxCard2 === -1) {
		console.error('❌ Required columns not found. Headers:', headers);
		return;
	}

	let updated = 0;
	let total = 0;
	const monthTotals = {};

	for (const r of data) {
		const yrRaw = r[idxYear];
		const moRaw = r[idxMonth];
		const dateStr = r[idxDate];
		const year = parseInt((yrRaw || '').toString().replace(/[^0-9]/g, ''), 10);
		const monthStr = getMonthAbbr((moRaw || '').toString());
		
		if (!year || !monthStr || year < 2020 || year > 2030) continue;

		const card = parseNumber(r[idxCard] || '0');
		const card2 = parseNumber(r[idxCard2] || '0');
		const ccFees = card - card2; // can be negative
		const epochMs = parseSheetDateToEpochMsLocal(dateStr);
		if (epochMs == null) {
			console.warn(`⚠️  Skipping row with unparsed date: ${dateStr}`);
			continue;
		}

		const sql = `UPDATE revenue_entries SET ccFees = ${ccFees} WHERE date = ${epochMs} AND year = ${year} AND month = '${monthStr}';`;
		try {
			execSync(`sqlite3 ${DB_PATH} "${sql}"`);
			updated++;
			total += ccFees;
			
			const key = `${monthStr}-${year}`;
			monthTotals[key] = (monthTotals[key] || 0) + ccFees;
			
			console.log(`✅ ${dateStr} → ccFees=${ccFees} (${monthStr} ${year})`);
		} catch (e) {
			console.error(`❌ Failed to update ${dateStr}:`, e.message);
		}
	}

	console.log(`\n📊 Done. Updated ${updated} rows. Total ccFees: ${total}`);
	console.log('\n📅 Monthly totals:');
	Object.keys(monthTotals).sort().forEach(key => {
		console.log(`  ${key}: $${monthTotals[key]}`);
	});
}

run().catch(e => {
	console.error('❌ Error:', e.message);
});
