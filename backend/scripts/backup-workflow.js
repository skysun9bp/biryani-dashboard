const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration
const BACKUP_SCRIPT = path.join(__dirname, 'backup-database.js');
const BACKUP_DIR = path.join(__dirname, '..', 'backups');

// Function to run backup
function runBackup() {
  return new Promise((resolve, reject) => {
    console.log('🔄 Starting backup process...');
    
    exec(`node "${BACKUP_SCRIPT}" backup`, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Backup failed:', error);
        reject(error);
        return;
      }
      
      console.log('✅ Backup completed successfully');
      console.log(stdout);
      resolve(stdout);
    });
  });
}

// Function to list backups
function listBackups() {
  return new Promise((resolve, reject) => {
    exec(`node "${BACKUP_SCRIPT}" list`, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Failed to list backups:', error);
        reject(error);
        return;
      }
      
      console.log(stdout);
      resolve(stdout);
    });
  });
}

// Function to restore from latest backup
function restoreFromLatest() {
  return new Promise((resolve, reject) => {
    // First list backups to get the latest one
    exec(`node "${BACKUP_SCRIPT}" list`, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Failed to list backups:', error);
        reject(error);
        return;
      }
      
      // Parse the output to get the latest backup file
      const lines = stdout.split('\n');
      const backupLine = lines.find(line => line.includes('1. railway-database-backup-'));
      
      if (!backupLine) {
        console.error('❌ No backup files found');
        reject(new Error('No backup files found'));
        return;
      }
      
      // Extract filename from the line
      const filename = backupLine.split(' ')[1];
      console.log('📁 Restoring from latest backup:', filename);
      
      // Restore the database
      exec(`node "${BACKUP_SCRIPT}" restore "${filename}"`, (error, stdout, stderr) => {
        if (error) {
          console.error('❌ Restore failed:', error);
          reject(error);
          return;
        }
        
        console.log('✅ Restore completed successfully');
        console.log(stdout);
        resolve(stdout);
      });
    });
  });
}

// Function to create pre-deployment backup
async function preDeploymentBackup() {
  console.log('🚀 Pre-deployment backup workflow');
  console.log('================================');
  
  try {
    // 1. Create backup from Railway
    await runBackup();
    
    // 2. List backups to confirm
    await listBackups();
    
    console.log('✅ Pre-deployment backup completed!');
    console.log('📝 You can now safely deploy to Railway');
    
  } catch (error) {
    console.error('❌ Pre-deployment backup failed:', error.message);
    process.exit(1);
  }
}

// Function to restore after deployment
async function postDeploymentRestore() {
  console.log('🔄 Post-deployment restore workflow');
  console.log('==================================');
  
  try {
    // 1. Restore from latest backup
    await restoreFromLatest();
    
    // 2. List backups to confirm
    await listBackups();
    
    console.log('✅ Post-deployment restore completed!');
    console.log('📝 Your local database is now synced with Railway');
    
  } catch (error) {
    console.error('❌ Post-deployment restore failed:', error.message);
    process.exit(1);
  }
}

// Main execution
async function main() {
  const command = process.argv[2];
  
  try {
    switch (command) {
      case 'pre-deploy':
        await preDeploymentBackup();
        break;
        
      case 'post-deploy':
        await postDeploymentRestore();
        break;
        
      case 'backup':
        await runBackup();
        break;
        
      case 'list':
        await listBackups();
        break;
        
      case 'restore':
        await restoreFromLatest();
        break;
        
      default:
        console.log('🔄 Database Backup Workflow Tool');
        console.log('\nUsage:');
        console.log('  node backup-workflow.js pre-deploy  - Backup before deploying to Railway');
        console.log('  node backup-workflow.js post-deploy - Restore after deploying to Railway');
        console.log('  node backup-workflow.js backup      - Create backup from Railway');
        console.log('  node backup-workflow.js list        - List existing backups');
        console.log('  node backup-workflow.js restore     - Restore from latest backup');
        console.log('\nWorkflow:');
        console.log('  1. Before deploying: node backup-workflow.js pre-deploy');
        console.log('  2. Deploy to Railway (git push)');
        console.log('  3. After deploying: node backup-workflow.js post-deploy');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
