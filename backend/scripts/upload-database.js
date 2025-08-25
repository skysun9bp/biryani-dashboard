const fs = require('fs');
const path = require('path');
const https = require('https');

const LOCAL_DB_PATH = '/Users/gaganmekala/Downloads/biryani-dashboard/backend/prisma/dev.db';
const RAILWAY_URL = 'https://biryani-dashboard-production.up.railway.app';

async function uploadDatabase() {
  console.log('📤 Uploading local database to Railway...');
  
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
    
    // Read the database file
    const databaseBuffer = fs.readFileSync(LOCAL_DB_PATH);
    console.log('✅ Local database read successfully');
    
    // Upload to Railway
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'biryani-dashboard-production.up.railway.app',
        port: 443,
        path: '/api/migration/upload-database',
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
          'Content-Length': databaseBuffer.length
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          console.log(`📊 Response Status: ${res.statusCode}`);
          console.log(`📊 Response: ${data}`);
          
          if (res.statusCode === 200) {
            console.log('✅ Database uploaded successfully!');
            resolve(data);
          } else {
            console.log('❌ Database upload failed');
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        });
      });

      req.on('error', (error) => {
        console.error('❌ Upload request failed:', error);
        reject(error);
      });

      req.write(databaseBuffer);
      req.end();
    });
    
  } catch (error) {
    console.error('❌ Upload failed:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  uploadDatabase()
    .then(() => {
      console.log('🎉 Database upload completed!');
    })
    .catch((error) => {
      console.error('❌ Upload failed:', error.message);
      process.exit(1);
    });
}

module.exports = { uploadDatabase };
