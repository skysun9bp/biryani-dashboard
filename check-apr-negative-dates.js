const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

const SPREADSHEET_ID = process.env.VITE_SPREADSHEET_ID;
const API_KEY = process.env.VITE_GOOGLE_SHEETS_API_KEY;

const sheets = google.sheets({ version: 'v4', auth: API_KEY });

function parseNumber(value) {
	if (!value || value.toString().trim() === '') return 0;
	const num = parseFloat(value.toString().replace(/[$,]/g, ''));
	return isNaN(num) ? 0 : Math.round(num);
}

async function checkAprNegativeDates() {
	console.log('🔍 Checking April 2024 dates with negative CC Fees in Google Sheets...');

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

	// Check specific dates that had negative CC Fees
	const problemDates = ['18-Apr-24', '20-Apr-24', '22-Apr-24', '23-Apr-24', '25-Apr-24', '26-Apr-24'];

	console.log('📅 Checking specific dates in Google Sheets:');
	
	for (const targetDate of problemDates) {
		for (const row of data) {
			if (row.length <= Math.max(idxDate, idxMonth, idxYear, idxCard, idxCard2)) continue;

			const dateStr = row[idxDate];
			const month = row[idxMonth];
			const year = parseInt(row[idxYear] || '0');
			const cardValue = parseNumber(row[idxCard] || '0');
			const card2Value = parseNumber(row[idxCard2] || '0');
			const ccFeesValue = cardValue - card2Value;

			if (year === 2024 && (month === 'Apr' || month === 'April' || month === 'APR') && dateStr === targetDate) {
				console.log(`  ${targetDate}: Card $${cardValue} - Card2 $${card2Value} = CC Fees $${ccFeesValue}`);
				break;
			}
		}
	}

	// Also check all April 2024 entries to see the pattern
	console.log('\n📅 All April 2024 entries from Google Sheets:');
	let totalCCFees = 0;
	
	for (const row of data) {
		if (row.length <= Math.max(idxDate, idxMonth, idxYear, idxCard, idxCard2)) continue;

		const dateStr = row[idxDate];
		const month = row[idxMonth];
		const year = parseInt(row[idxYear] || '0');
		const cardValue = parseNumber(row[idxCard] || '0');
		const card2Value = parseNumber(row[idxCard2] || '0');
		const ccFeesValue = cardValue - card2Value;

		if (year === 2024 && (month === 'Apr' || month === 'April' || month === 'APR')) {
			if (ccFeesValue !== 0) {
				console.log(`  ${dateStr}: Card $${cardValue} - Card2 $${card2Value} = CC Fees $${ccFeesValue}`);
				totalCCFees += ccFeesValue;
			}
		}
	}

	console.log(`\n📊 Total April 2024 CC Fees from Google Sheets: $${totalCCFees}`);
}

checkAprNegativeDates().catch(e => {
	console.error('❌ Error:', e.message);
});
