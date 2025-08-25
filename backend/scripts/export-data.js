const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

async function exportData() {
  console.log('📤 Exporting data from Railway SQLite...');
  
  try {
    // Temporarily switch to SQLite
    const originalDbUrl = process.env.DATABASE_URL;
    process.env.DATABASE_URL = "file:./dev.db";
    
    // Initialize Prisma client for SQLite
    const sqlitePrisma = new PrismaClient();
    
    // Read all data
    console.log('👥 Reading users...');
    const users = await sqlitePrisma.user.findMany();
    console.log(`📊 Found ${users.length} users`);
    
    console.log('💰 Reading revenue entries...');
    const revenueEntries = await sqlitePrisma.revenueEntry.findMany();
    console.log(`📊 Found ${revenueEntries.length} revenue entries`);
    
    console.log('💸 Reading expense entries...');
    const expenseEntries = await sqlitePrisma.expenseEntry.findMany();
    console.log(`📊 Found ${expenseEntries.length} expense entries`);
    
    console.log('👥 Reading salary entries...');
    const salaryEntries = await sqlitePrisma.salaryEntry.findMany();
    console.log(`📊 Found ${salaryEntries.length} salary entries`);
    
    await sqlitePrisma.$disconnect();
    
    // Create export object
    const exportData = {
      users,
      revenueEntries,
      expenseEntries,
      salaryEntries,
      exportDate: new Date().toISOString(),
      summary: {
        users: users.length,
        revenueEntries: revenueEntries.length,
        expenseEntries: expenseEntries.length,
        salaryEntries: salaryEntries.length
      }
    };
    
    // Write to file
    const fs = require('fs');
    fs.writeFileSync('./exported-data.json', JSON.stringify(exportData, null, 2));
    
    console.log('✅ Data exported successfully to exported-data.json');
    console.log('\n📝 Summary:');
    console.log(`- Users: ${users.length}`);
    console.log(`- Revenue Entries: ${revenueEntries.length}`);
    console.log(`- Expense Entries: ${expenseEntries.length}`);
    console.log(`- Salary Entries: ${salaryEntries.length}`);
    
  } catch (error) {
    console.error('❌ Export failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  exportData();
}

module.exports = { exportData };
