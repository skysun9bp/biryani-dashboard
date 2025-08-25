const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function checkSqlite() {
  console.log('🔍 Checking Railway SQLite database...');
  
  try {
    // Connect to SQLite database
    const sqliteDb = new sqlite3.Database('./dev.db', (err) => {
      if (err) {
        console.error('❌ Error connecting to SQLite database:', err.message);
        throw err;
      }
      console.log('✅ Connected to SQLite database');
    });

    // Check what tables exist
    console.log('📋 Checking tables...');
    const tables = await querySqlite(sqliteDb, "SELECT name FROM sqlite_master WHERE type='table'");
    console.log('📊 Tables found:', tables.map(t => t.name));
    
    if (tables.length === 0) {
      console.log('❌ No tables found in SQLite database');
      return;
    }
    
    // Check each table for data
    for (const table of tables) {
      const count = await querySqlite(sqliteDb, `SELECT COUNT(*) as count FROM ${table.name}`);
      console.log(`📊 Table ${table.name}: ${count[0].count} records`);
      
      if (count[0].count > 0) {
        // Show first few records
        const sample = await querySqlite(sqliteDb, `SELECT * FROM ${table.name} LIMIT 3`);
        console.log(`📝 Sample data from ${table.name}:`, sample);
      }
    }
    
    sqliteDb.close();
    
  } catch (error) {
    console.error('❌ Check failed:', error);
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

// Run if called directly
if (require.main === module) {
  checkSqlite();
}

module.exports = { checkSqlite };
