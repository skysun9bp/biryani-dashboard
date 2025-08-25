const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

async function simpleImport() {
  console.log('🚀 Simple Railway import...');
  
  try {
    // Read export file
    const exportData = JSON.parse(fs.readFileSync('./postgresql-export.json', 'utf8'));
    console.log(`📊 Found: ${exportData.users.length} users, ${exportData.revenueEntries.length} revenue, ${exportData.expenseEntries.length} expenses, ${exportData.salaryEntries.length} salaries`);
    
    // Connect to PostgreSQL
    const prisma = new PrismaClient();
    
    // Import users first
    console.log('👥 Importing users...');
    for (const user of exportData.users) {
      try {
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
        console.log(`✅ User imported: ${user.email}`);
      } catch (error) {
        console.error(`❌ Error importing user ${user.email}:`, error.message);
      }
    }
    
    console.log('✅ Users import completed');
    
    // Test if we can query users
    const users = await prisma.user.findMany();
    console.log(`📊 Users in database: ${users.length}`);
    
    await prisma.$disconnect();
    console.log('🎉 Import completed successfully!');
    
  } catch (error) {
    console.error('❌ Import failed:', error);
  }
}

simpleImport();
