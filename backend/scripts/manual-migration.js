const { PrismaClient } = require('@prisma/client');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

async function manualMigration() {
  console.log('🔄 Starting manual migration from SQLite to PostgreSQL...');
  
  try {
    // Step 1: Connect to SQLite database directly
    console.log('📖 Reading from SQLite database...');
    const sqliteDb = new sqlite3.Database('./prisma/dev.db', (err) => {
      if (err) {
        console.error('❌ Error connecting to SQLite database:', err.message);
        throw err;
      }
      console.log('✅ Connected to SQLite database');
    });

    // Step 2: Read all data from SQLite
    console.log('👥 Reading users...');
    const users = await querySqlite(sqliteDb, 'SELECT * FROM users');
    console.log(`📊 Found ${users.length} users`);
    
    console.log('💰 Reading revenue entries...');
    const revenueEntries = await querySqlite(sqliteDb, 'SELECT * FROM revenue_entries');
    console.log(`📊 Found ${revenueEntries.length} revenue entries`);
    
    console.log('💸 Reading expense entries...');
    const expenseEntries = await querySqlite(sqliteDb, 'SELECT * FROM expense_entries');
    console.log(`📊 Found ${expenseEntries.length} expense entries`);
    
    console.log('👥 Reading salary entries...');
    const salaryEntries = await querySqlite(sqliteDb, 'SELECT * FROM salary_entries');
    console.log(`📊 Found ${salaryEntries.length} salary entries`);
    
    sqliteDb.close();
    
    // Step 3: Initialize Prisma client for PostgreSQL
    console.log('🔄 Connecting to PostgreSQL...');
    const postgresPrisma = new PrismaClient();
    
    // Step 4: Migrate Users
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
          createdAt: new Date(user.createdAt),
          updatedAt: new Date(user.updatedAt)
        }
      });
    }
    console.log(`✅ Migrated ${users.length} users`);

    // Step 5: Migrate Revenue Entries
    console.log('💰 Migrating revenue entries...');
    for (const entry of revenueEntries) {
      await postgresPrisma.revenueEntry.create({
        data: {
          id: entry.id,
          date: new Date(entry.date),
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
          createdAt: new Date(entry.createdAt),
          updatedAt: new Date(entry.updatedAt),
          createdBy: entry.createdBy
        }
      });
    }
    console.log(`✅ Migrated ${revenueEntries.length} revenue entries`);

    // Step 6: Migrate Expense Entries
    console.log('💸 Migrating expense entries...');
    for (const entry of expenseEntries) {
      await postgresPrisma.expenseEntry.create({
        data: {
          id: entry.id,
          date: new Date(entry.date),
          month: entry.month,
          year: entry.year,
          costType: entry.costType,
          expenseType: entry.expenseType,
          itemVendor: entry.itemVendor,
          amount: entry.amount,
          createdAt: new Date(entry.createdAt),
          updatedAt: new Date(entry.updatedAt),
          createdBy: entry.createdBy
        }
      });
    }
    console.log(`✅ Migrated ${expenseEntries.length} expense entries`);

    // Step 7: Migrate Salary Entries
    console.log('👥 Migrating salary entries...');
    for (const entry of salaryEntries) {
      await postgresPrisma.salaryEntry.create({
        data: {
          id: entry.id,
          date: new Date(entry.date),
          month: entry.month,
          year: entry.year,
          resourceName: entry.resourceName,
          amount: entry.amount,
          actualPaidDate: entry.actualPaidDate ? new Date(entry.actualPaidDate) : null,
          createdAt: new Date(entry.createdAt),
          updatedAt: new Date(entry.updatedAt),
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
    
    console.log('\n✅ Your data is now in the local PostgreSQL database!');
    console.log('📊 Next step: Copy this database to Railway');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Helper function to query SQLite
function querySqlite(db, query) {
  return new Promise((resolve, reject) => {
    db.all(query, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

// Run migration if called directly
if (require.main === module) {
  manualMigration();
}

module.exports = { manualMigration };
