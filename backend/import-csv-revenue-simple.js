const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

// Function to parse date from DD-MMM-YY format
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

  console.warn(`⚠️  Could not parse date: "${str}"`);
  return null;
}

// Function to parse number and handle empty values
function parseNumber(value) {
  if (!value || value.toString().trim() === '') return 0;
  const num = parseFloat(value.toString().replace(/[$,]/g, ''));
  return isNaN(num) ? 0 : num;
}

// Function to parse the single-line CSV data
function parseSingleLineCSV(csvContent) {
  // Split by carriage return to get individual records
  const records = csvContent.split('\r').filter(record => record.trim());
  const revenueData = [];
  
  console.log(`📊 Total records found: ${records.length}`);
  
  if (records.length === 0) {
    console.log('❌ No records found in CSV file');
    return revenueData;
  }
  
  // First record contains headers, skip it
  for (let i = 1; i < records.length; i++) {
    const record = records[i].trim();
    if (!record) continue;
    
    try {
      // Split by comma
      const values = record.split(',').map(v => v.trim());
      
      if (values.length < 30) {
        console.warn(`⚠️  Skipping record ${i}: insufficient values (${values.length})`);
        continue;
      }
      
      // Parse the values based on expected order
      const date = parseDate(values[0]);
      if (!date) {
        console.warn(`⚠️  Skipping record ${i}: invalid date "${values[0]}"`);
        continue;
      }
      
      const revenueEntry = {
        date: date,
        month: values[2],
        year: parseInt(values[1]),
        cashInReport: parseNumber(values[3]),
        card2: parseNumber(values[4]),
        card: parseNumber(values[5]),
        dd: parseNumber(values[6]),
        ue: parseNumber(values[7]),
        gh: parseNumber(values[8]),
        cn: parseNumber(values[9]),
        dd2: parseNumber(values[10]),
        ue2: parseNumber(values[11]),
        gh2: parseNumber(values[12]),
        cn2: parseNumber(values[13]),
        ddFees: parseNumber(values[14]),
        ueFees: parseNumber(values[15]),
        ghFees: parseNumber(values[16]),
        catering: parseNumber(values[17]),
        otherCash: parseNumber(values[18]),
        foodja: parseNumber(values[19]),
        foodja2: parseNumber(values[20]),
        foodjaFees: parseNumber(values[21]),
        zelle: parseNumber(values[22]),
        ezCater: parseNumber(values[23]),
        ezCater2: parseNumber(values[24]),
        ezCaterFees: parseNumber(values[25]),
        relish: parseNumber(values[26]),
        relish2: parseNumber(values[27]),
        relishFees: parseNumber(values[28]),
        waiterCom: parseNumber(values[29]),
        ccFees: parseNumber(values[30]),
        createdBy: 1
      };
      
      revenueData.push(revenueEntry);
      
    } catch (error) {
      console.warn(`⚠️  Error parsing record ${i}:`, error.message);
    }
  }
  
  return revenueData;
}

// Function to import revenue data
async function importRevenueData() {
  try {
    console.log('📖 Reading CSV file...');
    const csvContent = fs.readFileSync('rev_ent.csv', 'utf8');
    
    console.log('🔧 Parsing CSV data...');
    const revenueData = parseSingleLineCSV(csvContent);
    
    console.log(`📊 Found ${revenueData.length} revenue records to import`);
    
    if (revenueData.length === 0) {
      console.log('❌ No valid revenue data found');
      return;
    }
    
    // Show a sample record
    console.log('\n📋 Sample record:');
    console.log(JSON.stringify(revenueData[0], null, 2));
    
    // Check if we have any existing revenue data
    const existingCount = await prisma.revenueEntry.count();
    if (existingCount > 0) {
      console.log(`⚠️  Found ${existingCount} existing revenue records`);
      console.log('🧹 Clearing existing revenue data...');
      await prisma.revenueEntry.deleteMany({});
    }
    
    console.log('🚀 Starting import...');
    let successCount = 0;
    let errorCount = 0;
    
    // Import in batches to avoid memory issues
    const batchSize = 100;
    for (let i = 0; i < revenueData.length; i += batchSize) {
      const batch = revenueData.slice(i, i + batchSize);
      
      try {
        await prisma.revenueEntry.createMany({
          data: batch
        });
        
        successCount += batch.length;
        console.log(`✅ Imported batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(revenueData.length / batchSize)} (${successCount}/${revenueData.length} total)`);
        
      } catch (error) {
        console.error(`❌ Error importing batch ${Math.floor(i / batchSize) + 1}:`, error);
        errorCount += batch.length;
      }
    }
    
    console.log('\n📊 Import Summary:');
    console.log('='.repeat(50));
    console.log(`✅ Successfully imported: ${successCount} records`);
    console.log(`❌ Failed to import: ${errorCount} records`);
    console.log(`📈 Success rate: ${((successCount / revenueData.length) * 100).toFixed(1)}%`);
    
    // Verify the import
    const finalCount = await prisma.revenueEntry.count();
    console.log(`📊 Total revenue records in database: ${finalCount}`);
    
    if (successCount > 0) {
      console.log('\n🎉 Revenue data import completed successfully!');
    } else {
      console.log('\n⚠️  No revenue data was imported. Please check the CSV file format.');
    }
    
  } catch (error) {
    console.error('❌ Import failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the import
if (require.main === module) {
  importRevenueData().catch(console.error);
}

module.exports = { importRevenueData };
