const { PrismaClient } = require('@prisma/client');

async function directAdmin() {
  console.log('🚀 Direct admin creation starting...');
  
  try {
    console.log('📡 Connecting to PostgreSQL...');
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
    
    if (verifyUser) {
      console.log('✅ Admin user verified in database!');
      console.log('📊 Total users in database:', await prisma.user.count());
    } else {
      console.log('❌ Admin user not found after creation!');
    }
    
    await prisma.$disconnect();
    console.log('🎉 Direct admin creation completed successfully!');
    
  } catch (error) {
    console.error('❌ Direct admin creation failed:', error);
    console.error('🔍 Error details:', error.message);
  }
}

directAdmin();
