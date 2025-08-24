const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const RAILWAY_URL = 'https://biryani-dashboard-production.up.railway.app';
const BACKUP_DIR = path.join(__dirname, '..', 'backups');
const BACKUP_PREFIX = 'railway-database-backup';

// Create backup directory if it doesn't exist
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  console.log('📁 Created backup directory:', BACKUP_DIR);
}

// Function to download database from Railway
function downloadDatabase() {
  return new Promise((resolve, reject) => {
    const url = `${RAILWAY_URL}/api/migration/export-database`;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${BACKUP_PREFIX}-${timestamp}.db`;
    const filepath = path.join(BACKUP_DIR, filename);
    
    console.log('📥 Downloading database from Railway...');
    console.log('🔗 URL:', url);
    
    const file = fs.createWriteStream(filepath);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        const stats = fs.statSync(filepath);
        console.log('✅ Database backup completed!');
        console.log('📁 File:', filepath);
        console.log('📊 Size:', (stats.size / 1024).toFixed(2), 'KB');
        resolve(filepath);
      });
      
      file.on('error', (err) => {
        fs.unlink(filepath, () => {}); // Delete the file if there's an error
        reject(err);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Function to list existing backups
function listBackups() {
  const files = fs.readdirSync(BACKUP_DIR)
    .filter(file => file.startsWith(BACKUP_PREFIX))
    .sort()
    .reverse();
  
  console.log('\n📋 Existing backups:');
  files.forEach((file, index) => {
    const filepath = path.join(BACKUP_DIR, file);
    const stats = fs.statSync(filepath);
    const date = new Date(stats.mtime);
    console.log(`${index + 1}. ${file} (${date.toLocaleString()}) - ${(stats.size / 1024).toFixed(2)} KB`);
  });
  
  return files;
}

// Function to restore database from backup
function restoreDatabase(backupFile) {
  const backupPath = path.join(BACKUP_DIR, backupFile);
  const targetPath = path.join(__dirname, '..', 'prisma', 'dev.db');
  
  if (!fs.existsSync(backupPath)) {
    console.error('❌ Backup file not found:', backupPath);
    return false;
  }
  
  try {
    fs.copyFileSync(backupPath, targetPath);
    console.log('✅ Database restored from backup!');
    console.log('📁 From:', backupPath);
    console.log('📁 To:', targetPath);
    return true;
  } catch (error) {
    console.error('❌ Error restoring database:', error.message);
    return false;
  }
}

// Main execution
async function main() {
  const command = process.argv[2];
  
  try {
    switch (command) {
      case 'backup':
        await downloadDatabase();
        break;
        
      case 'list':
        listBackups();
        break;
        
      case 'restore':
        const backupFile = process.argv[3];
        if (!backupFile) {
          console.error('❌ Please specify a backup file to restore');
          console.log('Usage: node backup-database.js restore <filename>');
          console.log('Example: node backup-database.js restore railway-database-backup-2025-08-24T22-45-00-000Z.db');
          return;
        }
        restoreDatabase(backupFile);
        break;
        
      default:
        console.log('📚 Database Backup Tool');
        console.log('\nUsage:');
        console.log('  node backup-database.js backup    - Download database from Railway');
        console.log('  node backup-database.js list      - List existing backups');
        console.log('  node backup-database.js restore <file> - Restore database from backup');
        console.log('\nExamples:');
        console.log('  node backup-database.js backup');
        console.log('  node backup-database.js list');
        console.log('  node backup-database.js restore railway-database-backup-2025-08-24T22-45-00-000Z.db');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
