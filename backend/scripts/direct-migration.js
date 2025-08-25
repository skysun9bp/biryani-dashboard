const { PrismaClient } = require('@prisma/client');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Create a temporary .env file for SQLite connection
const tempEnvPath = './.env.sqlite';
const originalDbUrl = process.env.DATABASE_URL;

// Save original DATABASE_URL and create SQLite version
fs.writeFileSync(tempEnvPath, `DATABASE_URL="file:./dev.db"\n`);

async function migrateDirectly() {
  console.log('🔄 Starting direct migration from SQLite to PostgreSQL...');
  
  try {
    // Step 1: Temporarily switch to SQLite for reading
    console.log('📖 Reading from SQLite database...');
    process.env.DATABASE_URL = "file:./dev.db";
    
    // Step 2: Initialize Prisma client for SQLite
    const sqlitePrisma = new PrismaClient();
    
    // Step 3: Read all data from SQLite
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
    
    // Step 4: Switch back to PostgreSQL for writing
    console.log('🔄 Switching to PostgreSQL...');
    process.env.DATABASE_URL = originalDbUrl;
    
    // Step 5: Initialize Prisma client for PostgreSQL
    const postgresPrisma = new PrismaClient();
    
    // Step 6: Migrate Users
    console.log('👥 Migrating users...');
    for (const user of users) {
      await postgresPrisma.user.upsert({
        where: { email: user.email },
        update: {},
        create: {
          id: user.id,
          email: user.email,
          password: user.password,
          name: user.name,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      });
    }
    console.log(`✅ Migrated ${users.length} users`);

    // Step 7: Migrate Revenue Entries
    console.log('💰 Migrating revenue entries...');
    for (const entry of revenueEntries) {
      await postgresPrisma.revenueEntry.create({
        data: {
          id: entry.id,
          date: entry.date,
          month: entry.month,
          year: entry.year,
          cashInReport: entry.cashInReport,
          card2: entry.card2,
          card: entry.card,
          dd: entry.dd,
          ue: entry.ue,
          gh: entry.gh,
          cn: entry.cn,
          dd2: entry.dd2,
          ue2: entry.ue2,
          gh2: entry.gh2,
          cn2: entry.cn2,
          ddFees: entry.ddFees,
          ueFees: entry.ueFees,
          ghFees: entry.ghFees,
          catering: entry.catering,
          otherCash: entry.otherCash,
          foodja: entry.foodja,
          foodja2: entry.foodja2,
          foodjaFees: entry.foodjaFees,
          zelle: entry.zelle,
          relish: entry.relish,
          relish2: entry.relish2,
          relishFees: entry.relishFees,
          ezCater: entry.ezCater,
          ezCater2: entry.ezCater2,
          ezCaterFees: entry.ezCaterFees,
          waiterCom: entry.waiterCom,
          ccFees: entry.ccFees,
          createdAt: entry.createdAt,
          updatedAt: entry.updatedAt,
          createdBy: entry.createdBy
        }
      });
    }
    console.log(`✅ Migrated ${revenueEntries.length} revenue entries`);

    // Step 8: Migrate Expense Entries
    console.log('💸 Migrating expense entries...');
    for (const entry of expenseEntries) {
      await postgresPrisma.expenseEntry.create({
        data: {
          id: entry.id,
          date: entry.date,
          month: entry.month,
          year: entry.year,
          costType: entry.costType,
          expenseType: entry.expenseType,
          itemVendor: entry.itemVendor,
          amount: entry.amount,
          createdAt: entry.createdAt,
          updatedAt: entry.updatedAt,
          createdBy: entry.createdBy
        }
      });
    }
    console.log(`✅ Migrated ${expenseEntries.length} expense entries`);

    // Step 9: Migrate Salary Entries
    console.log('👥 Migrating salary entries...');
    for (const entry of salaryEntries) {
      await postgresPrisma.salaryEntry.create({
        data: {
          id: entry.id,
          date: entry.date,
          month: entry.month,
          year: entry.year,
          resourceName: entry.resourceName,
          amount: entry.amount,
          actualPaidDate: entry.actualPaidDate,
          createdAt: entry.createdAt,
          updatedAt: entry.updatedAt,
          createdBy: entry.createdBy
        }
      });
    }
    console.log(`✅ Migrated ${salaryEntries.length} salary entries`);

    await postgresPrisma.$disconnect();
    
    console.log('🎉 Migration completed successfully!');
    console.log('\n📝 Summary:');
    console.log(`- Users: ${users.length}`);
    console.log(`- Revenue Entries: ${revenueEntries.length}`);
    console.log(`- Expense Entries: ${expenseEntries.length}`);
    console.log(`- Salary Entries: ${salaryEntries.length}`);
    
    // Clean up
    if (fs.existsSync(tempEnvPath)) {
      fs.unlinkSync(tempEnvPath);
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    
    // Clean up on error
    if (fs.existsSync(tempEnvPath)) {
      fs.unlinkSync(tempEnvPath);
    }
    
    process.exit(1);
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateDirectly();
}

module.exports = { migrateDirectly };
