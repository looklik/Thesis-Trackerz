// Script to add an admin user to the database
const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    // Check if the admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: {
        email: 'admin@admin.com',
      },
    });

    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Hash the password
    const hashedPassword = await hash('admin', 10);

    // Create the admin user
    const admin = await prisma.user.create({
      data: {
        name: 'Admin',
        email: 'admin@admin.com',
        password: hashedPassword,
        role: 'admin',
      },
    });

    console.log('Admin user created successfully:', admin);
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 