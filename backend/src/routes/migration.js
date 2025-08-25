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

// SQLite to PostgreSQL migration endpoint
router.post('/sqlite-to-postgresql', async (req, res) => {
  try {
    console.log('🔄 SQLite to PostgreSQL migration triggered...');
    
    // Run the railway migration v2 script
    const migrationScript = path.join(__dirname, '..', '..', 'scripts', 'railway-migration-v2.js');
    
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
        message: 'SQLite to PostgreSQL migration completed successfully',
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

// Export data as JSON endpoint
router.get('/export-data', async (req, res) => {
  try {
    console.log('📤 Exporting data as JSON...');
    
    // Temporarily switch to SQLite for reading
    const originalDbUrl = process.env.DATABASE_URL;
    process.env.DATABASE_URL = "file:./dev.db";
    
    // Import Prisma dynamically
    const { PrismaClient } = require('@prisma/client');
    const sqlitePrisma = new PrismaClient();
    
    // Read all data
    console.log('👥 Reading users...');
    const users = await sqlitePrisma.user.findMany();
    console.log(`📊 Found ${users.length} users`);
    
    console.log('💰 Reading revenue entries...');
    const revenueEntries = await sqlitePrisma.revenueEntry.findMany();
    console.log(`📊 Found ${revenueEntries.length} revenue entries`);
    
    console.log('💸 Reading expense entries...');
    const expenseEntries = await sqlitePrisma.expenseEntry.findMany();
    console.log(`📊 Found ${expenseEntries.length} expense entries`);
    
    console.log('👥 Reading salary entries...');
    const salaryEntries = await sqlitePrisma.salaryEntry.findMany();
    console.log(`📊 Found ${salaryEntries.length} salary entries`);
    
    await sqlitePrisma.$disconnect();
    
    // Create export object
    const exportData = {
      users,
      revenueEntries,
      expenseEntries,
      salaryEntries,
      exportDate: new Date().toISOString(),
      summary: {
        users: users.length,
        revenueEntries: revenueEntries.length,
        expenseEntries: expenseEntries.length,
        salaryEntries: salaryEntries.length
      }
    };
    
    console.log('✅ Data exported successfully');
    
    res.json({
      success: true,
      message: 'Data exported successfully',
      data: exportData
    });
    
  } catch (error) {
    console.error('❌ Error exporting data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export data',
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

// Upload database endpoint
router.post('/upload-database', async (req, res) => {
  try {
    console.log('📤 Uploading database file...');
    
    // Get the raw body data
    const databaseBuffer = req.body;
    
    if (!databaseBuffer || databaseBuffer.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No database file provided'
      });
    }
    
    console.log(`📊 Received database file: ${databaseBuffer.length} bytes`);
    
    // Convert to Buffer if needed
    let buffer;
    if (Buffer.isBuffer(databaseBuffer)) {
      buffer = databaseBuffer;
    } else if (typeof databaseBuffer === 'string') {
      buffer = Buffer.from(databaseBuffer, 'binary');
    } else {
      buffer = Buffer.from(databaseBuffer);
    }
    
    // Write the database file
    const fs = require('fs');
    const dbPath = './dev.db';
    
    fs.writeFileSync(dbPath, buffer);
    
    console.log('✅ Database file saved successfully');
    
    res.json({
      success: true,
      message: 'Database uploaded successfully',
      size: buffer.length
    });
    
  } catch (error) {
    console.error('❌ Error uploading database:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload database',
      details: error.message
    });
  }
});

// Check SQLite database endpoint
router.get('/check-sqlite', async (req, res) => {
  try {
    console.log('🔍 Checking SQLite database...');
    
    // Run the check script
    const checkScript = path.join(__dirname, '..', '..', 'scripts', 'check-sqlite.js');
    
    exec(`node "${checkScript}"`, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Check failed:', error);
        return res.status(500).json({
          success: false,
          error: 'Check failed',
          details: error.message,
          stderr: stderr
        });
      }
      
      console.log('✅ Check completed');
      console.log('📊 Check output:', stdout);
      
      res.json({
        success: true,
        message: 'SQLite database check completed',
        output: stdout
      });
    });
    
  } catch (error) {
    console.error('❌ Error checking SQLite:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check SQLite',
      details: error.message
    });
  }
});

// Find database files endpoint
router.get('/find-databases', async (req, res) => {
  try {
    console.log('🔍 Searching for database files...');
    
    // Run the find databases script
    const findScript = path.join(__dirname, '..', '..', 'scripts', 'find-databases.js');
    
    exec(`node "${findScript}"`, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Search failed:', error);
        return res.status(500).json({
          success: false,
          error: 'Search failed',
          details: error.message,
          stderr: stderr
        });
      }
      
      console.log('✅ Search completed');
      console.log('📊 Search output:', stdout);
      
      res.json({
        success: true,
        message: 'Database search completed',
        output: stdout
      });
    });
    
  } catch (error) {
    console.error('❌ Error searching for databases:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search for databases',
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
      'migrate:clean',
      'sqlite-to-postgresql',
      'export-data',
      'check-sqlite'
    ]
  });
});

module.exports = router;
