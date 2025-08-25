const fs = require('fs');
const path = require('path');

function findDatabases() {
  console.log('🔍 Searching for database files...');
  
  try {
    // Check current directory
    const currentDir = process.cwd();
    console.log('📁 Current directory:', currentDir);
    
    // List all files in current directory
    const files = fs.readdirSync(currentDir);
    console.log('📋 Files in current directory:', files);
    
    // Look for database files
    const dbFiles = files.filter(file => 
      file.endsWith('.db') || 
      file.endsWith('.sqlite') || 
      file.endsWith('.sqlite3')
    );
    
    console.log('🗄️ Database files found:', dbFiles);
    
    // Check each database file
    for (const dbFile of dbFiles) {
      const dbPath = path.join(currentDir, dbFile);
      const stats = fs.statSync(dbPath);
      console.log(`📊 ${dbFile}: ${stats.size} bytes`);
      
      if (stats.size > 0) {
        console.log(`✅ ${dbFile} has data (${stats.size} bytes)`);
      } else {
        console.log(`❌ ${dbFile} is empty`);
      }
    }
    
    // Check common database locations
    const commonPaths = [
      './dev.db',
      './prisma/dev.db',
      './database.db',
      './data.db',
      './app.db'
    ];
    
    console.log('\n🔍 Checking common database paths...');
    for (const dbPath of commonPaths) {
      if (fs.existsSync(dbPath)) {
        const stats = fs.statSync(dbPath);
        console.log(`✅ ${dbPath}: ${stats.size} bytes`);
      } else {
        console.log(`❌ ${dbPath}: not found`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error searching for databases:', error);
  }
}

// Run if called directly
if (require.main === module) {
  findDatabases();
}

module.exports = { findDatabases };
