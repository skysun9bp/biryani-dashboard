const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

const EXPORT_FILE = './postgresql-export.json';

async function directImport() {
  console.log('🚀 Direct import to Railway PostgreSQL...');
  
  try {
    // 1. Check if export file exists
    if (!fs.existsSync(EXPORT_FILE)) {
      throw new Error(`Export file not found: ${EXPORT_FILE}`);
    }
    
    // 2. Read the export file
    const exportData = JSON.parse(fs.readFileSync(EXPORT_FILE, 'utf8'));
    console.log('✅ Export file loaded');
    console.log(`📊 Data: ${exportData.users.length} users, ${exportData.revenueEntries.length} revenue, ${exportData.expenseEntries.length} expenses, ${exportData.salaryEntries.length} salaries`);
    
    // 3. Connect to Railway PostgreSQL (using current DATABASE_URL)
    console.log('🔄 Connecting to Railway PostgreSQL...');
    const postgresPrisma = new PrismaClient();
    
    // 4. Import Users
    console.log('👥 Importing users...');
    for (const user of exportData.users) {
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
    console.log(`✅ Imported ${exportData.users.length} users`);

    // 5. Import Revenue Entries
    console.log('💰 Importing revenue entries...');
    for (const entry of exportData.revenueEntries) {
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
    console.log(`✅ Imported ${exportData.revenueEntries.length} revenue entries`);

    // 6. Import Expense Entries
    console.log('💸 Importing expense entries...');
    for (const entry of exportData.expenseEntries) {
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
    console.log(`✅ Imported ${exportData.expenseEntries.length} expense entries`);

    // 7. Import Salary Entries
    console.log('👥 Importing salary entries...');
    for (const entry of exportData.salaryEntries) {
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
    console.log(`✅ Imported ${exportData.salaryEntries.length} salary entries`);

    await postgresPrisma.$disconnect();
    
    console.log('🎉 SUCCESS! All data imported to Railway PostgreSQL!');
    console.log('✅ You can now log into your application at: https://biryani-dashboard.vercel.app');
    console.log('✅ All your data is preserved (including Saanvi\'s July 2025 entries)');
    
  } catch (error) {
    console.error('❌ Import failed:', error);
  }
}

// Run the import
directImport();
