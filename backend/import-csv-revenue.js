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
  // Split by carriage return and newline combinations
  const lines = csvContent.split(/\r?\n/).filter(line => line.trim());
  const revenueData = [];
  
  if (lines.length === 0) {
    console.log('❌ No lines found in CSV file');
    return revenueData;
  }
  
  // Get headers from first line
  const headerLine = lines[0];
  const headers = headerLine.split(',').map(h => h.trim().replace(/\r/g, ''));
  
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
          values.push(currentValue.trim().replace(/\r/g, ''));
          currentValue = '';
          continue;
        }
        
        currentValue += char;
      }
      
      // Add the last value
      if (currentValue.trim()) {
        values.push(currentValue.trim().replace(/\r/g, ''));
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
      const date = parseDate(row['Date']);
      if (!date) {
        console.warn(`⚠️  Skipping line ${i + 1}: invalid date "${row['Date']}"`);
        continue;
      }
      
      // Create revenue entry object
      const revenueEntry = {
        date: date,
        month: row['Month'],
        year: parseInt(row['Year']),
        cashInReport: parseNumber(row['cashInReport']),
        card2: parseNumber(row['Card2']),
        card: parseNumber(row['Card']),
        dd: parseNumber(row['DD']),
        ue: parseNumber(row['UE']),
        gh: parseNumber(row['GH']),
        cn: parseNumber(row['CN']),
        dd2: parseNumber(row['DD2']),
        ue2: parseNumber(row['UE2']),
        gh2: parseNumber(row['GH2']),
        cn2: parseNumber(row['CN2']),
        ddFees: parseNumber(row['DD Fees']),
        ueFees: parseNumber(row['UE Fees']),
        ghFees: parseNumber(row['GH Fees']),
        catering: parseNumber(row['Catering']),
        otherCash: parseNumber(row['otherCash']),
        foodja: parseNumber(row['Foodja']),
        foodja2: parseNumber(row['Foodja2']),
        foodjaFees: parseNumber(row['Foodja Fees']),
        zelle: parseNumber(row['Zelle']),
        ezCater: parseNumber(row['Ez Cater']),
        ezCater2: parseNumber(row['Ez Cater2']),
        ezCaterFees: parseNumber(row['EzCater Fees']),
        relish: parseNumber(row['Relish']),
        relish2: parseNumber(row['Relish2']),
        relishFees: parseNumber(row['Relish Fees']),
        waiterCom: parseNumber(row['waiter.com']),
        ccFees: parseNumber(row['CC Fees']),
        createdBy: 1
      };
      
      revenueData.push(revenueEntry);
      
    } catch (error) {
      console.warn(`⚠️  Error parsing line ${i + 1}:`, error.message);
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
    const revenueData = parseCSVData(csvContent);
    
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
          data: batch,
          skipDuplicates: true
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
