const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('🚀 PostgreSQL Migration Setup');
console.log('============================');

async function setupPostgreSQL() {
  try {
    console.log('1️⃣  Step 1: Download Railway database...');
    
    // First, download the Railway database using our backup script
    await runCommand('node scripts/backup-database.js backup');
    
    console.log('\n2️⃣  Step 2: Generate Prisma client for PostgreSQL...');
    
    // Generate Prisma client for PostgreSQL
    await runCommand('npx prisma generate');
    
    console.log('\n3️⃣  Step 3: Create PostgreSQL database...');
    
    // Create database tables
    await runCommand('npx prisma db push');
    
    console.log('\n4️⃣  Step 4: Migrate data from SQLite to PostgreSQL...');
    
    // Run the migration script
    await runCommand('node scripts/migrate-to-postgresql.js');
    
    console.log('\n✅ PostgreSQL setup completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Update Railway DATABASE_URL to PostgreSQL connection string');
    console.log('2. Deploy the updated code to Railway');
    console.log('3. Test the application with PostgreSQL');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

function runCommand(command) {
  return new Promise((resolve, reject) => {
    console.log(`🔄 Running: ${command}`);
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Command failed: ${command}`);
        console.error('Error:', error.message);
        reject(error);
        return;
      }
      
      if (stdout) console.log(stdout);
      if (stderr) console.log(stderr);
      
      console.log(`✅ Command completed: ${command}`);
      resolve(stdout);
    });
  });
}

// Run setup if called directly
if (require.main === module) {
  setupPostgreSQL();
}

module.exports = { setupPostgreSQL };
