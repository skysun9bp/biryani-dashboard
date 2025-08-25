const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const LOCAL_DB_PATH = '/Users/gaganmekala/Downloads/biryani-dashboard/backend/prisma/dev.db';
const RAILWAY_URL = 'https://biryani-dashboard-production.up.railway.app';

async function copyDatabase() {
  console.log('📤 Copying local database to Railway...');
  
  try {
    // Check if local database exists
    if (!fs.existsSync(LOCAL_DB_PATH)) {
      throw new Error(`Local database not found at: ${LOCAL_DB_PATH}`);
    }
    
    const stats = fs.statSync(LOCAL_DB_PATH);
    console.log(`📊 Local database size: ${stats.size} bytes`);
    
    if (stats.size === 0) {
      throw new Error('Local database is empty');
    }
    
    // Use curl to upload the file
    const curlCommand = `curl -X POST -H "Content-Type: application/octet-stream" --data-binary "@${LOCAL_DB_PATH}" ${RAILWAY_URL}/api/migration/upload-database`;
    
    console.log('🔄 Uploading database...');
    
    exec(curlCommand, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Upload failed:', error);
        return;
      }
      
      if (stderr) {
        console.log('⚠️ stderr:', stderr);
      }
      
      console.log('📊 Response:', stdout);
      console.log('✅ Database upload completed!');
    });
    
  } catch (error) {
    console.error('❌ Copy failed:', error);
  }
}

// Run if called directly
if (require.main === module) {
  copyDatabase();
}

module.exports = { copyDatabase };
