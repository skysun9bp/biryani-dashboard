const { PrismaClient } = require('@prisma/client');

async function createAdmin() {
  console.log('👤 Creating admin user...');
  
  try {
    const prisma = new PrismaClient();
    
    // Create admin user
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@biryani.com' },
      update: {},
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
    
    console.log('✅ Admin user created:', adminUser.email);
    
    // Check total users
    const users = await prisma.user.findMany();
    console.log(`📊 Total users in database: ${users.length}`);
    
    await prisma.$disconnect();
    console.log('🎉 Admin user creation completed!');
    
  } catch (error) {
    console.error('❌ Error creating admin:', error);
  }
}

createAdmin();
