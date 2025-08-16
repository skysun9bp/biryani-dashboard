const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function clearExistingData() {
  console.log('🧹 Clearing existing data...');
  
  try {
    // Clear all data in the correct order (respecting foreign key constraints)
    const deleteResults = await Promise.all([
      prisma.revenueEntry.deleteMany({}),
      prisma.expenseEntry.deleteMany({}),
      prisma.salaryEntry.deleteMany({})
    ]);

    console.log('✅ Existing data cleared successfully!');
    console.log(`📊 Deleted records:`);
    console.log(`   - Revenue: ${deleteResults[0].count}`);
    console.log(`   - Expenses: ${deleteResults[1].count}`);
    console.log(`   - Salaries: ${deleteResults[2].count}`);
    
    return true;
  } catch (error) {
    console.error('❌ Error clearing data:', error);
    return false;
  }
}

async function runImprovedMigration() {
  console.log('\n🚀 Running improved migration...');
  
  try {
    // Import and run the improved migration
    const { runMigration } = require('./migrate-from-sheets-improved.js');
    await runMigration();
  } catch (error) {
    console.error('❌ Error running improved migration:', error);
    return false;
  }
}

async function main() {
  console.log('🔄 Starting Clean Migration Process...');
  
  try {
    // Step 1: Clear existing data
    const cleared = await clearExistingData();
    if (!cleared) {
      console.error('❌ Failed to clear existing data. Aborting migration.');
      process.exit(1);
    }

    // Step 2: Run improved migration
    const migrated = await runImprovedMigration();
    if (!migrated) {
      console.error('❌ Failed to run improved migration.');
      process.exit(1);
    }

    console.log('\n🎉 Clean migration completed successfully!');
    console.log('🌐 Your dashboard now has all your data migrated correctly.');
    
  } catch (error) {
    console.error('❌ Clean migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the clean migration
main().catch(console.error);
