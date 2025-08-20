const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

// Function to parse date from MM/DD/YY format
function parseDate(dateStr) {
  if (!dateStr || dateStr.toString().trim() === '') return null;
  
  const str = dateStr.toString().trim();
  
  // Handle MM/DD/YY format (e.g., "6/30/25")
  const mmDdYyMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2})$/);
  if (mmDdYyMatch) {
    const [, month, day, year] = mmDdYyMatch;
    const fullYear = parseInt(year) < 50 ? `20${year}` : `19${year}`;
    const date = new Date(parseInt(fullYear), parseInt(month) - 1, parseInt(day));
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
  const salaryData = [];
  
  console.log(`📊 Total records found: ${records.length}`);
  
  if (records.length === 0) {
    console.log('❌ No records found in CSV file');
    return salaryData;
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
      const date = parseDate(values[1]); // date is at index 1
      if (!date) {
        console.warn(`⚠️  Skipping record ${i}: invalid date "${values[1]}"`);
        continue;
      }
      
      const actualPaidDate = parseDate(values[6]); // actualPaidDate is at index 6
      
      const salaryEntry = {
        date: date,
        month: values[2],
        year: parseInt(values[3]),
        resourceName: values[4],
        amount: parseNumber(values[5]),
        actualPaidDate: actualPaidDate,
        createdBy: 1
      };
      
      salaryData.push(salaryEntry);
      
    } catch (error) {
      console.warn(`⚠️  Error parsing record ${i}:`, error.message);
    }
  }
  
  return salaryData;
}

// Function to import salary data
async function importSalaryData() {
  try {
    console.log('📖 Reading CSV file...');
    const csvContent = fs.readFileSync('sal_ent.csv', 'utf8');
    
    console.log('🔧 Parsing CSV data...');
    const salaryData = parseSingleLineCSV(csvContent);
    
    console.log(`📊 Found ${salaryData.length} salary records to import`);
    
    if (salaryData.length === 0) {
      console.log('❌ No valid salary data found');
      return;
    }
    
    // Show a sample record
    console.log('\n📋 Sample record:');
    console.log(JSON.stringify(salaryData[0], null, 2));
    
    // Check if we have any existing salary data
    const existingCount = await prisma.salaryEntry.count();
    if (existingCount > 0) {
      console.log(`⚠️  Found ${existingCount} existing salary records`);
      console.log('🧹 Clearing existing salary data...');
      await prisma.salaryEntry.deleteMany({});
    }
    
    console.log('🚀 Starting import...');
    let successCount = 0;
    let errorCount = 0;
    
    // Import in batches to avoid memory issues
    const batchSize = 100;
    for (let i = 0; i < salaryData.length; i += batchSize) {
      const batch = salaryData.slice(i, i + batchSize);
      
      try {
        await prisma.salaryEntry.createMany({
          data: batch
        });
        
        successCount += batch.length;
        console.log(`✅ Imported batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(salaryData.length / batchSize)} (${successCount}/${salaryData.length} total)`);
        
      } catch (error) {
        console.error(`❌ Error importing batch ${Math.floor(i / batchSize) + 1}:`, error);
        errorCount += batch.length;
      }
    }
    
    console.log('\n📊 Import Summary:');
    console.log('='.repeat(50));
    console.log(`✅ Successfully imported: ${successCount} records`);
    console.log(`❌ Failed to import: ${errorCount} records`);
    console.log(`📈 Success rate: ${((successCount / salaryData.length) * 100).toFixed(1)}%`);
    
    // Verify the import
    const finalCount = await prisma.salaryEntry.count();
    console.log(`📊 Total salary records in database: ${finalCount}`);
    
    if (successCount > 0) {
      console.log('\n🎉 Salary data import completed successfully!');
    } else {
      console.log('\n⚠️  No salary data was imported. Please check the CSV file format.');
    }
    
  } catch (error) {
    console.error('❌ Import failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the import
if (require.main === module) {
  importSalaryData().catch(console.error);
}

module.exports = { importSalaryData };
