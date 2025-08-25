const { PrismaClient } = require('@prisma/client');
const sqlite3 = require('sqlite3').verbose();
const https = require('https');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const RAILWAY_URL = 'https://biryani-dashboard-production.up.railway.app';
const SQLITE_DB_PATH = './railway-database.db';

async function downloadRailwayDatabase() {
  console.log('📥 Downloading Railway SQLite database...');
  
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(SQLITE_DB_PATH);
    
    https.get(`${RAILWAY_URL}/api/migration/export-database`, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download database: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log('✅ Railway database downloaded successfully');
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(SQLITE_DB_PATH, () => {}); // Delete the file async
      reject(err);
    });
  });
}

async function migrateToRailwayPostgreSQL() {
  console.log('🔄 Starting migration from Railway SQLite to Railway PostgreSQL...');
  
  try {
    // Step 1: Download Railway database
    await downloadRailwayDatabase();
    
    // Step 2: Initialize Prisma client for PostgreSQL
    const prisma = new PrismaClient();
    
    // Step 3: Connect to SQLite database
    const sqliteDb = new sqlite3.Database(SQLITE_DB_PATH, (err) => {
      if (err) {
        console.error('❌ Error connecting to SQLite database:', err.message);
        throw err;
      }
      console.log('✅ Connected to Railway SQLite database');
    });

    // Step 4: Migrate Users
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

    // Step 5: Migrate Revenue Entries
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

    // Step 6: Migrate Expense Entries
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

    // Step 7: Migrate Salary Entries
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
    console.log('\n📝 Next steps:');
    console.log('1. Update Railway environment variables to use PostgreSQL DATABASE_URL');
    console.log('2. Deploy the updated code to Railway');
    console.log('3. Test the application with PostgreSQL');
    
    // Clean up
    sqliteDb.close();
    await prisma.$disconnect();
    fs.unlinkSync(SQLITE_DB_PATH);
    
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

// Export function for use in other scripts
module.exports = { migrateToRailwayPostgreSQL };

// Run migration if called directly
if (require.main === module) {
  migrateToRailwayPostgreSQL();
}
