const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

// Function to parse date from DD-MMM-YY format
function parseDate(dateStr) {
  if (!dateStr || dateStr.toString().trim() === '') return null;
  
  const str = dateStr.toString().trim();
  
  // Handle DD-MMM-YY format (e.g., "31-Oct-23")
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
  const expenseData = [];
  
  console.log(`📊 Total records found: ${records.length}`);
  
  if (records.length === 0) {
    console.log('❌ No records found in CSV file');
    return expenseData;
  }
  
  // First record contains headers, skip it
  for (let i = 1; i < records.length; i++) {
    const record = records[i].trim();
    if (!record) continue;
    
    try {
      // Split by comma, but handle quoted values
      const values = [];
      let currentValue = '';
      let inQuotes = false;
      let quoteChar = '';
      
      for (let j = 0; j < record.length; j++) {
        const char = record[j];
        
        if ((char === "'" || char === '"') && !inQuotes) {
          inQuotes = true;
          quoteChar = char;
          continue;
        }
        
        if (char === quoteChar && inQuotes) {
          inQuotes = false;
          quoteChar = '';
          continue;
        }
        
        if (char === ',' && !inQuotes) {
          values.push(currentValue.trim());
          currentValue = '';
          continue;
        }
        
        currentValue += char;
      }
      
      // Add the last value
      if (currentValue.trim()) {
        values.push(currentValue.trim());
      }
      
      if (values.length < 9) {
        console.warn(`⚠️  Skipping record ${i}: insufficient values (${values.length})`);
        continue;
      }
      
      // Parse the values based on expected order
      const date = parseDate(values[0]);
      if (!date) {
        console.warn(`⚠️  Skipping record ${i}: invalid date "${values[0]}"`);
        continue;
      }
      
      const expenseEntry = {
        date: date,
        month: values[1],
        year: parseInt(values[2]),
        costType: values[3],
        expenseType: values[4] || null,
        itemVendor: values[5] || null,
        amount: parseNumber(values[6]),
        createdBy: 1
      };
      
      expenseData.push(expenseEntry);
      
    } catch (error) {
      console.warn(`⚠️  Error parsing record ${i}:`, error.message);
    }
  }
  
  return expenseData;
}

// Function to import expense data
async function importExpenseData() {
  try {
    console.log('📖 Reading CSV file...');
    const csvContent = fs.readFileSync('exp_ent.csv', 'utf8');
    
    console.log('🔧 Parsing CSV data...');
    const expenseData = parseSingleLineCSV(csvContent);
    
    console.log(`📊 Found ${expenseData.length} expense records to import`);
    
    if (expenseData.length === 0) {
      console.log('❌ No valid expense data found');
      return;
    }
    
    // Show a sample record
    console.log('\n📋 Sample record:');
    console.log(JSON.stringify(expenseData[0], null, 2));
    
    // Check if we have any existing expense data
    const existingCount = await prisma.expenseEntry.count();
    if (existingCount > 0) {
      console.log(`⚠️  Found ${existingCount} existing expense records`);
      console.log('🧹 Clearing existing expense data...');
      await prisma.expenseEntry.deleteMany({});
    }
    
    console.log('🚀 Starting import...');
    let successCount = 0;
    let errorCount = 0;
    
    // Import in batches to avoid memory issues
    const batchSize = 100;
    for (let i = 0; i < expenseData.length; i += batchSize) {
      const batch = expenseData.slice(i, i + batchSize);
      
      try {
        await prisma.expenseEntry.createMany({
          data: batch
        });
        
        successCount += batch.length;
        console.log(`✅ Imported batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(expenseData.length / batchSize)} (${successCount}/${expenseData.length} total)`);
        
      } catch (error) {
        console.error(`❌ Error importing batch ${Math.floor(i / batchSize) + 1}:`, error);
        errorCount += batch.length;
      }
    }
    
    console.log('\n📊 Import Summary:');
    console.log('='.repeat(50));
    console.log(`✅ Successfully imported: ${successCount} records`);
    console.log(`❌ Failed to import: ${errorCount} records`);
    console.log(`📈 Success rate: ${((successCount / expenseData.length) * 100).toFixed(1)}%`);
    
    // Verify the import
    const finalCount = await prisma.expenseEntry.count();
    console.log(`📊 Total expense records in database: ${finalCount}`);
    
    if (successCount > 0) {
      console.log('\n🎉 Expense data import completed successfully!');
    } else {
      console.log('\n⚠️  No expense data was imported. Please check the CSV file format.');
    }
    
  } catch (error) {
    console.error('❌ Import failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the import
if (require.main === module) {
  importExpenseData().catch(console.error);
}

module.exports = { importExpenseData };
