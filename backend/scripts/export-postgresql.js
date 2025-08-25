const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
require('dotenv').config();

async function exportPostgreSQL() {
  console.log('📤 Exporting data from local PostgreSQL...');
  
  try {
    // Initialize Prisma client for local PostgreSQL
    const postgresPrisma = new PrismaClient();
    
    // Read all data
    console.log('👥 Reading users...');
    const users = await postgresPrisma.user.findMany();
    console.log(`📊 Found ${users.length} users`);
    
    console.log('💰 Reading revenue entries...');
    const revenueEntries = await postgresPrisma.revenueEntry.findMany();
    console.log(`📊 Found ${revenueEntries.length} revenue entries`);
    
    console.log('💸 Reading expense entries...');
    const expenseEntries = await postgresPrisma.expenseEntry.findMany();
    console.log(`📊 Found ${expenseEntries.length} expense entries`);
    
    console.log('👥 Reading salary entries...');
    const salaryEntries = await postgresPrisma.salaryEntry.findMany();
    console.log(`📊 Found ${salaryEntries.length} salary entries`);
    
    await postgresPrisma.$disconnect();
    
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
    fs.writeFileSync('./postgresql-export.json', JSON.stringify(exportData, null, 2));
    
    console.log('✅ Data exported successfully to postgresql-export.json');
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
  exportPostgreSQL();
}

module.exports = { exportPostgreSQL };
