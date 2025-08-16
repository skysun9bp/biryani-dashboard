import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

interface BackupData {
  revenue: any[];
  expenses: any[];
  salaries: any[];
  users: any[];
  timestamp: string;
}

async function createBackup() {
  console.log('💾 Creating database backup...');
  
  try {
    // Fetch all data
    const [revenue, expenses, salaries, users] = await Promise.all([
      prisma.revenueEntry.findMany(),
      prisma.expenseEntry.findMany(),
      prisma.salaryEntry.findMany(),
      prisma.user.findMany()
    ]);

    const backupData: BackupData = {
      revenue,
      expenses,
      salaries,
      users,
      timestamp: new Date().toISOString()
    };

    // Create backup directory if it doesn't exist
    const backupDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Create backup file
    const backupFile = path.join(backupDir, `backup-${new Date().toISOString().split('T')[0]}.json`);
    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));

    console.log('✅ Backup created successfully!');
    console.log(`📁 Location: ${backupFile}`);
    console.log(`📊 Records backed up:`);
    console.log(`   - Revenue: ${revenue.length}`);
    console.log(`   - Expenses: ${expenses.length}`);
    console.log(`   - Salaries: ${salaries.length}`);
    console.log(`   - Users: ${users.length}`);

  } catch (error) {
    console.error('❌ Backup failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createBackup().catch(console.error);
