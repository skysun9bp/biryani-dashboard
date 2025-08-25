const https = require('https');

const RAILWAY_URL = 'https://biryani-dashboard-production.up.railway.app';

async function triggerMigration() {
  console.log('🔄 Triggering migration on Railway...');
  
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'biryani-dashboard-production.up.railway.app',
      port: 443,
      path: '/api/migration/sqlite-to-postgresql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': 0
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
          console.log('✅ Migration triggered successfully!');
          resolve(data);
        } else {
          console.log('❌ Migration failed to trigger');
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request failed:', error);
      reject(error);
    });

    req.end();
  });
}

// Run if called directly
if (require.main === module) {
  triggerMigration()
    .then(() => {
      console.log('🎉 Migration process completed!');
    })
    .catch((error) => {
      console.error('❌ Migration failed:', error.message);
      process.exit(1);
    });
}

module.exports = { triggerMigration };
