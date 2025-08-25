const fs = require('fs');
const https = require('https');

const EXPORT_FILE = './postgresql-export.json';
const RAILWAY_URL = 'https://biryani-dashboard-production.up.railway.app';

function importToRailway() {
  console.log('🚀 Final import to Railway PostgreSQL...');
  
  try {
    // 1. Check if export file exists
    if (!fs.existsSync(EXPORT_FILE)) {
      throw new Error(`Export file not found: ${EXPORT_FILE}`);
    }
    
    // 2. Read the export file
    const exportData = JSON.parse(fs.readFileSync(EXPORT_FILE, 'utf8'));
    console.log('✅ Export file loaded');
    console.log(`📊 Data: ${exportData.users.length} users, ${exportData.revenueEntries.length} revenue, ${exportData.expenseEntries.length} expenses, ${exportData.salaryEntries.length} salaries`);
    
    // 3. Send to Railway
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

    console.log('📤 Sending data to Railway...');
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`📊 Status: ${res.statusCode}`);
        
        if (res.statusCode === 200) {
          console.log('🎉 SUCCESS! Data imported to Railway PostgreSQL!');
          console.log('✅ You can now log into your application');
        } else {
          console.log('❌ Import failed:', data);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request failed:', error.message);
    });

    req.write(postData);
    req.end();
    
  } catch (error) {
    console.error('❌ Import failed:', error.message);
  }
}

// Run the import
importToRailway();
