const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

async function railwayImport() {
  console.log('🚀 Railway import script...');
  
  try {
    // Read the export file
    const exportData = JSON.parse(fs.readFileSync('./postgresql-export.json', 'utf8'));
    console.log(`📊 Data: ${exportData.users.length} users, ${exportData.revenueEntries.length} revenue, ${exportData.expenseEntries.length} expenses, ${exportData.salaryEntries.length} salaries`);
    
    // Connect to PostgreSQL
    const prisma = new PrismaClient();
    
    // Import all data
    console.log('👥 Importing users...');
    for (const user of exportData.users) {
      await prisma.user.upsert({
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
    
    console.log('💰 Importing revenue...');
    for (const entry of exportData.revenueEntries) {
      await prisma.revenueEntry.create({ data: { ...entry, date: new Date(entry.date), createdAt: new Date(entry.createdAt), updatedAt: new Date(entry.updatedAt) } });
    }
    
    console.log('💸 Importing expenses...');
    for (const entry of exportData.expenseEntries) {
      await prisma.expenseEntry.create({ data: { ...entry, date: new Date(entry.date), createdAt: new Date(entry.createdAt), updatedAt: new Date(entry.updatedAt) } });
    }
    
    console.log('👥 Importing salaries...');
    for (const entry of exportData.salaryEntries) {
      await prisma.salaryEntry.create({ data: { ...entry, date: new Date(entry.date), createdAt: new Date(entry.createdAt), updatedAt: new Date(entry.updatedAt) } });
    }
    
    await prisma.$disconnect();
    console.log('🎉 SUCCESS! Data imported to Railway PostgreSQL!');
    
  } catch (error) {
    console.error('❌ Import failed:', error);
  }
}

railwayImport();
