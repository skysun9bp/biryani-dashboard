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

  // Try parsing with Date constructor directly
  const directDate = new Date(str);
  if (!isNaN(directDate.getTime())) {
    return directDate;
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

// Function to parse CSV data
function parseCSVData(csvContent) {
  const lines = csvContent.split('\n').filter(line => line.trim());
  const salaryData = [];
  
  if (lines.length === 0) {
    console.log('❌ No lines found in CSV file');
    return salaryData;
  }
  
  // Get headers from first line
  const headers = lines[0].split(',').map(h => h.trim());
  console.log('📋 CSV Headers:', headers);
  console.log(`📊 Total lines in file: ${lines.length}`);
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    try {
      // Split by comma, but handle quoted values
      const values = [];
      let currentValue = '';
      let inQuotes = false;
      let quoteChar = '';
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        
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
      
      if (values.length < headers.length) {
        console.warn(`⚠️  Skipping line ${i + 1}: insufficient values (${values.length} vs ${headers.length})`);
        continue;
      }
      
      // Create object from headers and values
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      
      // Parse date
      const date = parseDate(row['date']);
      if (!date) {
        console.warn(`⚠️  Skipping line ${i + 1}: invalid date "${row['date']}"`);
        continue;
      }
      
      // Parse actual paid date
      const actualPaidDate = parseDate(row['actualPaidDate']);
      
      // Create salary entry object
      const salaryEntry = {
        date: date,
        month: row['month'],
        year: parseInt(row['year']),
        resourceName: row['resourceName'],
        amount: parseNumber(row['amount']),
        actualPaidDate: actualPaidDate,
        createdBy: 1
      };
      
      salaryData.push(salaryEntry);
      
    } catch (error) {
      console.warn(`⚠️  Error parsing line ${i + 1}:`, error.message);
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
    const salaryData = parseCSVData(csvContent);
    
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
