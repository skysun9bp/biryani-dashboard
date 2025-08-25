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

// Import data endpoint
router.post('/import-data', async (req, res) => {
  try {
    console.log('📥 Importing data to Railway PostgreSQL...');
    
    const importData = req.body;
    
    if (!importData || !importData.users || !importData.revenueEntries || !importData.expenseEntries || !importData.salaryEntries) {
      return res.status(400).json({
        success: false,
        error: 'Invalid import data format'
      });
    }
    
    console.log(`📊 Importing: ${importData.users.length} users, ${importData.revenueEntries.length} revenue, ${importData.expenseEntries.length} expenses, ${importData.salaryEntries.length} salaries`);
    
    // Initialize Prisma client for PostgreSQL
    const { PrismaClient } = require('@prisma/client');
    const postgresPrisma = new PrismaClient();
    
    // Import Users
    console.log('👥 Importing users...');
    for (const user of importData.users) {
      await postgresPrisma.user.upsert({
        where: { email: user.email },
        update: {},
        create: {
          id: user.id,
          email: user.email,
          password: user.password,
          name: user.name,
          role: user.role,
          createdAt: new Date(user.createdAt),
          updatedAt: new Date(user.updatedAt)
        }
      });
    }
    console.log(`✅ Imported ${importData.users.length} users`);

    // Import Revenue Entries
    console.log('💰 Importing revenue entries...');
    for (const entry of importData.revenueEntries) {
      await postgresPrisma.revenueEntry.create({
        data: {
          id: entry.id,
          date: new Date(entry.date),
          month: entry.month,
          year: entry.year,
          cashInReport: entry.cashInReport,
          card2: entry.card2,
          card: entry.card,
          dd: entry.dd,
          ue: entry.ue,
          gh: entry.gh,
          cn: entry.cn,
          dd2: entry.dd2,
          ue2: entry.ue2,
          gh2: entry.gh2,
          cn2: entry.cn2,
          ddFees: entry.ddFees,
          ueFees: entry.ueFees,
          ghFees: entry.ghFees,
          catering: entry.catering,
          otherCash: entry.otherCash,
          foodja: entry.foodja,
          foodja2: entry.foodja2,
          foodjaFees: entry.foodjaFees,
          zelle: entry.zelle,
          relish: entry.relish,
          relish2: entry.relish2,
          relishFees: entry.relishFees,
          ezCater: entry.ezCater,
          ezCater2: entry.ezCater2,
          ezCaterFees: entry.ezCaterFees,
          waiterCom: entry.waiterCom,
          ccFees: entry.ccFees,
          createdAt: new Date(entry.createdAt),
          updatedAt: new Date(entry.updatedAt),
          createdBy: entry.createdBy
        }
      });
    }
    console.log(`✅ Imported ${importData.revenueEntries.length} revenue entries`);

    // Import Expense Entries
    console.log('💸 Importing expense entries...');
    for (const entry of importData.expenseEntries) {
      await postgresPrisma.expenseEntry.create({
        data: {
          id: entry.id,
          date: new Date(entry.date),
          month: entry.month,
          year: entry.year,
          costType: entry.costType,
          expenseType: entry.expenseType,
          itemVendor: entry.itemVendor,
          amount: entry.amount,
          createdAt: new Date(entry.createdAt),
          updatedAt: new Date(entry.updatedAt),
          createdBy: entry.createdBy
        }
      });
    }
    console.log(`✅ Imported ${importData.expenseEntries.length} expense entries`);

    // Import Salary Entries
    console.log('👥 Importing salary entries...');
    for (const entry of importData.salaryEntries) {
      await postgresPrisma.salaryEntry.create({
        data: {
          id: entry.id,
          date: new Date(entry.date),
          month: entry.month,
          year: entry.year,
          resourceName: entry.resourceName,
          amount: entry.amount,
          actualPaidDate: entry.actualPaidDate ? new Date(entry.actualPaidDate) : null,
          createdAt: new Date(entry.createdAt),
          updatedAt: new Date(entry.updatedAt),
          createdBy: entry.createdBy
        }
      });
    }
    console.log(`✅ Imported ${importData.salaryEntries.length} salary entries`);

    await postgresPrisma.$disconnect();
    
    console.log('🎉 Data import completed successfully!');
    
    res.json({
      success: true,
      message: 'Data imported successfully to Railway PostgreSQL',
      summary: importData.summary
    });
    
  } catch (error) {
    console.error('❌ Error importing data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to import data',
      details: error.message
    });
  }
});

// Simple Railway import endpoint
router.post('/railway-import', async (req, res) => {
  try {
    console.log('🚀 Running Railway import...');
    
    // Run the railway import script
    const importScript = path.join(__dirname, '..', '..', 'scripts', 'railway-import.js');
    
    exec(`node "${importScript}"`, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Import failed:', error);
        return res.status(500).json({
          success: false,
          error: 'Import failed',
          details: error.message,
          stderr: stderr
        });
      }
      
      console.log('✅ Import completed successfully');
      console.log('📊 Import output:', stdout);
      
      res.json({
        success: true,
        message: 'Data imported successfully to Railway PostgreSQL',
        output: stdout
      });
    });
    
  } catch (error) {
    console.error('❌ Error running import:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to run import',
      details: error.message
    });
  }
});

// Simple import endpoint
router.post('/simple-import', async (req, res) => {
  try {
    console.log('🚀 Running simple import...');
    
    // Run the simple import script
    const importScript = path.join(__dirname, '..', '..', 'scripts', 'simple-railway-import.js');
    
    exec(`node "${importScript}"`, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Import failed:', error);
        return res.status(500).json({
          success: false,
          error: 'Import failed',
          details: error.message,
          stderr: stderr
        });
      }
      
      console.log('✅ Import completed successfully');
      console.log('📊 Import output:', stdout);
      
      res.json({
        success: true,
        message: 'Simple import completed successfully',
        output: stdout
      });
    });
    
  } catch (error) {
    console.error('❌ Error running import:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to run import',
      details: error.message
    });
  }
});

// Test users endpoint
router.get('/test-users', async (req, res) => {
  try {
    console.log('🔍 Testing users in database...');
    
    // Initialize Prisma client
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    // Query users
    const users = await prisma.user.findMany();
    
    await prisma.$disconnect();
    
    console.log(`📊 Found ${users.length} users in database`);
    
    res.json({
      success: true,
      message: `Found ${users.length} users in database`,
      users: users.map(user => ({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }))
    });
    
  } catch (error) {
    console.error('❌ Error testing users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to test users',
      details: error.message
    });
  }
});

// Create admin endpoint
router.post('/create-admin', async (req, res) => {
  try {
    console.log('👤 Creating admin user...');
    
    // Run the create admin script
    const adminScript = path.join(__dirname, '..', '..', 'scripts', 'create-admin.js');
    
    exec(`node "${adminScript}"`, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Admin creation failed:', error);
        return res.status(500).json({
          success: false,
          error: 'Admin creation failed',
          details: error.message,
          stderr: stderr
        });
      }
      
      console.log('✅ Admin creation completed successfully');
      console.log('📊 Admin creation output:', stdout);
      
      res.json({
        success: true,
        message: 'Admin user created successfully',
        output: stdout
      });
    });
    
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create admin',
      details: error.message
    });
  }
});

// Direct admin endpoint
router.post('/direct-admin', async (req, res) => {
  try {
    console.log('🚀 Running direct admin creation...');
    
    // Run the direct admin script
    const adminScript = path.join(__dirname, '..', '..', 'scripts', 'direct-admin.js');
    
    exec(`node "${adminScript}"`, { timeout: 30000 }, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Direct admin creation failed:', error);
        return res.status(500).json({
          success: false,
          error: 'Direct admin creation failed',
          details: error.message,
          stderr: stderr
        });
      }
      
      console.log('✅ Direct admin creation completed successfully');
      console.log('📊 Direct admin creation output:', stdout);
      
      res.json({
        success: true,
        message: 'Direct admin creation completed successfully',
        output: stdout
      });
    });
    
  } catch (error) {
    console.error('❌ Error running direct admin creation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to run direct admin creation',
      details: error.message
    });
  }
});

// Direct admin creation in route handler
router.post('/create-admin-direct', async (req, res) => {
  try {
    console.log('🚀 Creating admin user directly in route handler...');
    
    // Initialize Prisma client
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    console.log('👤 Creating admin user...');
    
    // Create admin user with exact credentials from export
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@biryani.com' },
      update: {
        password: '$2b$12$ZshE.L5k6bThK.ZKmzwdue3I..3CG/zmkpJZTkdPYN6v6sEuRR7tO',
        name: 'Admin User',
        role: 'ADMIN'
      },
      create: {
        id: 1,
        email: 'admin@biryani.com',
        password: '$2b$12$ZshE.L5k6bThK.ZKmzwdue3I..3CG/zmkpJZTkdPYN6v6sEuRR7tO',
        name: 'Admin User',
        role: 'ADMIN',
        createdAt: new Date('2025-08-15T23:31:54.071Z'),
        updatedAt: new Date('2025-08-15T23:31:54.071Z')
      }
    });
    
    console.log('✅ Admin user created/updated successfully!');
    console.log('📧 Email:', adminUser.email);
    console.log('👤 Name:', adminUser.name);
    console.log('🔑 Role:', adminUser.role);
    
    // Verify by querying
    console.log('🔍 Verifying admin user...');
    const verifyUser = await prisma.user.findUnique({
      where: { email: 'admin@biryani.com' }
    });
    
    let verificationMessage = '';
    if (verifyUser) {
      verificationMessage = '✅ Admin user verified in database!';
      console.log(verificationMessage);
    } else {
      verificationMessage = '❌ Admin user not found after creation!';
      console.log(verificationMessage);
    }
    
    const totalUsers = await prisma.user.count();
    console.log('📊 Total users in database:', totalUsers);
    
    await prisma.$disconnect();
    console.log('🎉 Direct admin creation completed successfully!');
    
    res.json({
      success: true,
      message: 'Admin user created successfully',
      adminUser: {
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role
      },
      verification: verificationMessage,
      totalUsers: totalUsers
    });
    
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create admin',
      details: error.message
    });
  }
});

// Run Prisma migrations
router.post('/run-migrations', async (req, res) => {
  try {
    console.log('🚀 Running Prisma migrations...');
    
    // Run prisma migrate deploy
    exec('npx prisma migrate deploy', { timeout: 60000 }, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Migration failed:', error);
        return res.status(500).json({
          success: false,
          error: 'Migration failed',
          details: error.message,
          stderr: stderr
        });
      }
      
      console.log('✅ Migrations completed successfully');
      console.log('📊 Migration output:', stdout);
      
      res.json({
        success: true,
        message: 'Migrations completed successfully',
        output: stdout
      });
    });
    
  } catch (error) {
    console.error('❌ Error running migrations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to run migrations',
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
