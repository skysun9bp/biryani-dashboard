const fs = require('fs');
const https = require('https');

const RAILWAY_URL = 'https://biryani-dashboard-production.up.railway.app';
const EXPORT_FILE = './postgresql-export.json';

async function importToRailway() {
  console.log('📤 Importing data to Railway PostgreSQL...');
  
  try {
    // Check if export file exists
    if (!fs.existsSync(EXPORT_FILE)) {
      throw new Error(`Export file not found: ${EXPORT_FILE}`);
    }
    
    // Read the export file
    const exportData = JSON.parse(fs.readFileSync(EXPORT_FILE, 'utf8'));
    console.log('✅ Export file loaded successfully');
    console.log(`📊 Data summary:`, exportData.summary);
    
    // Send to Railway
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify(exportData);
      
      const options = {
        hostname: 'biryani-dashboard-production.up.railway.app',
        port: 443,
        path: '/api/migration/import-data',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
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
            console.log('✅ Data imported successfully to Railway!');
            resolve(data);
          } else {
            console.log('❌ Data import failed');
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        });
      });

      req.on('error', (error) => {
        console.error('❌ Import request failed:', error);
        reject(error);
      });

      req.write(postData);
      req.end();
    });
    
  } catch (error) {
    console.error('❌ Import failed:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  importToRailway()
    .then(() => {
      console.log('🎉 Data import completed!');
    })
    .catch((error) => {
      console.error('❌ Import failed:', error.message);
      process.exit(1);
    });
}

module.exports = { importToRailway };
