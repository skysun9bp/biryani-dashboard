const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

async function seed() {
  try {
    console.log('🌱 Starting database seed...');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const admin = await prisma.user.upsert({
      where: { email: 'admin@biryani.com' },
      update: {},
      create: {
        email: 'admin@biryani.com',
        password: adminPassword,
        name: 'Admin User',
        role: 'ADMIN'
      }
    });

    // Create regular user
    const userPassword = await bcrypt.hash('user123', 12);
    const user = await prisma.user.upsert({
      where: { email: 'user@biryani.com' },
      update: {},
      create: {
        email: 'user@biryani.com',
        password: userPassword,
        name: 'Regular User',
        role: 'USER'
      }
    });

    console.log('✅ Database seeded successfully!');
    console.log('👤 Admin User:', admin.email, '(password: admin123)');
    console.log('👤 Regular User:', user.email, '(password: user123)');
    console.log('\n🔐 Login credentials:');
    console.log('Admin: admin@biryani.com / admin123');
    console.log('User: user@biryani.com / user123');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();


