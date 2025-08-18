const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const path = require('path');

// Migration endpoint - triggers data sync from Google Sheets
router.post('/trigger', async (req, res) => {
  try {
    console.log('🔄 Migration triggered via API...');
    
    // Run the migration script
    const migrationScript = path.join(__dirname, '..', '..', 'migrate-final.js');
    
    exec(`node "${migrationScript}"`, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Migration failed:', error);
        return res.status(500).json({
          success: false,
          error: 'Migration failed',
          details: error.message,
          stderr: stderr
        });
      }
      
      console.log('✅ Migration completed successfully');
      console.log('📊 Migration output:', stdout);
      
      res.json({
        success: true,
        message: 'Migration completed successfully',
        output: stdout
      });
    });
    
  } catch (error) {
    console.error('❌ Error triggering migration:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to trigger migration',
      details: error.message
    });
  }
});

// Get migration status
router.get('/status', (req, res) => {
  res.json({
    status: 'ready',
    message: 'Migration system is ready',
    availableScripts: [
      'migrate:final',
      'migrate:improved', 
      'migrate:clean'
    ]
  });
});

module.exports = router;
