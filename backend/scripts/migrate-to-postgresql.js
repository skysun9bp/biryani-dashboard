const { PrismaClient } = require('@prisma/client');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

// Initialize Prisma client for PostgreSQL
const prisma = new PrismaClient();

// SQLite database path (Railway database)
const sqliteDbPath = './dev.db'; // This will be the Railway database

async function migrateToPostgreSQL() {
  console.log('🔄 Starting migration from SQLite to PostgreSQL...');
  
  try {
    // Connect to SQLite database
    const sqliteDb = new sqlite3.Database(sqliteDbPath, (err) => {
      if (err) {
        console.error('❌ Error connecting to SQLite database:', err.message);
        throw err;
      }
      console.log('✅ Connected to SQLite database');
    });

    // Migrate Users
    console.log('👥 Migrating users...');
    const users = await querySqlite(sqliteDb, 'SELECT * FROM users');
    for (const user of users) {
      await prisma.user.upsert({
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

    // Migrate Revenue Entries
    console.log('💰 Migrating revenue entries...');
    const revenueEntries = await querySqlite(sqliteDb, 'SELECT * FROM revenue_entries');
    for (const entry of revenueEntries) {
      await prisma.revenueEntry.create({
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

    // Migrate Expense Entries
    console.log('💸 Migrating expense entries...');
    const expenseEntries = await querySqlite(sqliteDb, 'SELECT * FROM expense_entries');
    for (const entry of expenseEntries) {
      await prisma.expenseEntry.create({
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

    // Migrate Salary Entries
    console.log('👥 Migrating salary entries...');
    const salaryEntries = await querySqlite(sqliteDb, 'SELECT * FROM salary_entries');
    for (const entry of salaryEntries) {
      await prisma.salaryEntry.create({
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

    console.log('🎉 Migration completed successfully!');
    
    // Close connections
    sqliteDb.close();
    await prisma.$disconnect();
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    await prisma.$disconnect();
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

// Export function for use in other scripts
module.exports = { migrateToPostgreSQL };

// Run migration if called directly
if (require.main === module) {
  migrateToPostgreSQL();
}
