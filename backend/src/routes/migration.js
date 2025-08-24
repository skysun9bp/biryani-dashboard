const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

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

// Export database endpoint
router.get('/export-database', async (req, res) => {
  try {
    console.log('📤 Exporting database...');
    
    // Get the database file path from environment
    const dbPath = process.env.DATABASE_URL?.replace('file:', '') || './dev.db';
    
    // Check if database file exists
    if (!fs.existsSync(dbPath)) {
      return res.status(404).json({
        success: false,
        error: 'Database file not found',
        path: dbPath
      });
    }
    
    // Read the database file
    const databaseBuffer = fs.readFileSync(dbPath);
    
    // Set headers for file download
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', 'attachment; filename="railway-database.db"');
    res.setHeader('Content-Length', databaseBuffer.length);
    
    // Send the database file
    res.send(databaseBuffer);
    
    console.log('✅ Database exported successfully');
    
  } catch (error) {
    console.error('❌ Error exporting database:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export database',
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
