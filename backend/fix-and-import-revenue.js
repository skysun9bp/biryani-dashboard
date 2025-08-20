const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

// Function to convert Excel serial number to date
function excelSerialToDate(serial) {
  // Excel serial numbers start from January 1, 1900
  // But Excel incorrectly treats 1900 as a leap year, so we need to adjust
  const excelEpoch = new Date(1900, 0, 1);
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  
  // Subtract 2 days to account for Excel's leap year bug
  const date = new Date(excelEpoch.getTime() + (serial - 2) * millisecondsPerDay);
  return date;
}

// Function to parse and clean the SQL file
function parseRevenueData(sqlContent) {
  const lines = sqlContent.split('\n');
  const revenueData = [];
  
  for (const line of lines) {
    if (!line.trim() || !line.includes('INSERT INTO')) continue;
    
    try {
      // Remove the outer quotes and extract the INSERT statement
      const cleanLine = line.replace(/^"|"$/g, '');
      
      // Extract values from the INSERT statement
      const valuesMatch = cleanLine.match(/VALUES\s*\((.*)\)/);
      if (!valuesMatch) continue;
      
      const valuesStr = valuesMatch[1];
      
      // Split by comma, but be careful with quoted values
      const values = [];
      let currentValue = '';
      let inQuotes = false;
      let quoteChar = '';
      
      for (let i = 0; i < valuesStr.length; i++) {
        const char = valuesStr[i];
        
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
      
      if (values.length < 30) continue; // Skip incomplete rows
      
      // Parse the values - handle the specific column order from the SQL file
      const excelDate = parseInt(values[0]);
      const year = parseInt(values[1]);
      const month = values[2];
      const cashInReport = parseFloat(values[3]) || 0;
      const card = parseFloat(values[4]) || 0;
      const card2 = parseFloat(values[5]) || 0;
      const dd = parseFloat(values[6]) || 0;
      const ue = parseFloat(values[7]) || 0;
      const gh = parseFloat(values[8]) || 0;
      const cn = parseFloat(values[9]) || 0;
      const dd2 = parseFloat(values[10]) || 0;
      const ue2 = parseFloat(values[11]) || 0;
      const gh2 = parseFloat(values[12]) || 0;
      const cn2 = parseFloat(values[13]) || 0;
      const ddFees = parseFloat(values[14]) || 0;
      const ueFees = parseFloat(values[15]) || 0;
      const ghFees = parseFloat(values[16]) || 0;
      const catering = parseFloat(values[17]) || 0;
      const otherCash = parseFloat(values[18]) || 0;
      const foodja = parseFloat(values[19]) || 0;
      const foodja2 = parseFloat(values[20]) || 0;
      const foodjaFees = parseFloat(values[21]) || 0;
      const zelle = parseFloat(values[22]) || 0;
      const ezCater = parseFloat(values[23]) || 0;
      const ezCater2 = parseFloat(values[24]) || 0;
      const ezCaterFees = parseFloat(values[25]) || 0;
      const relish = parseFloat(values[26]) || 0;
      const relish2 = parseFloat(values[27]) || 0;
      const relishFees = parseFloat(values[28]) || 0;
      const waiterCom = parseFloat(values[29]) || 0;
      
      // Convert Excel date to proper date
      const date = excelSerialToDate(excelDate);
      
      revenueData.push({
        date,
        month,
        year,
        cashInReport,
        card,
        card2,
        dd,
        ue,
        gh,
        cn,
        dd2,
        ue2,
        gh2,
        cn2,
        ddFees,
        ueFees,
        ghFees,
        catering,
        otherCash,
        foodja,
        foodja2,
        foodjaFees,
        zelle,
        ezCater,
        ezCater2,
        ezCaterFees,
        relish,
        relish2,
        relishFees,
        waiterCom,
        ccFees: 0, // Default value
        createdBy: 1
      });
      
    } catch (error) {
      console.warn(`⚠️  Skipping malformed line: ${line.substring(0, 100)}...`);
    }
  }
  
  return revenueData;
}

// Function to import revenue data
async function importRevenueData() {
  try {
    console.log('📖 Reading revenue SQL file...');
    const sqlContent = fs.readFileSync('revenue_inserts.sql', 'utf8');
    
    console.log('🔧 Parsing and cleaning data...');
    const revenueData = parseRevenueData(sqlContent);
    
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
      console.log('\n⚠️  No revenue data was imported. Please check the SQL file format.');
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
