const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    const email = 'admin@admin.com';
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      console.log('Admin user already exists');
      return;
    }
    const hashedPassword = await hash('admin', 10);
    const admin = await prisma.user.create({
      data: {
        name: 'Admin',
        email,
        password: hashedPassword,
        role: 'admin',
        studentId: `ADMIN-${Date.now()}`,
      },
    });
    console.log('Admin user created successfully:', admin.id);
  } catch (err) {
    console.error('Error creating admin user:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 