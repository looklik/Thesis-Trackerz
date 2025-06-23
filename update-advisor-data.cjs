const { PrismaClient } = require('@prisma/client');

async function updateAdvisorData() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔄 Updating advisor data...');
    
    // Find the advisor by email
    const advisor = await prisma.user.findFirst({
      where: {
        email: 'thepthida100@gmail.com',
        role: 'teacher'
      }
    });
    
    if (!advisor) {
      console.log('❌ Advisor not found');
      return;
    }
    
    console.log('✅ Found advisor:', advisor.name);
    
    // Update advisor with complete data
    const updatedAdvisor = await prisma.user.update({
      where: {
        id: advisor.id
      },
      data: {
        phoneNumber: '02-123-4567',
        workplace: 'Office 301, Engineering Building',
        department: 'Electrical Engineering',
        academicPosition: 'Associate Professor',
        shortPosition: 'Assoc. Prof.',
        educationHistory: [
          'Ph.D. in Electrical Engineering, Chulalongkorn University (2010)',
          'M.Eng. in Computer Engineering, KMUTT (2005)',
          'B.Eng. in Electrical Engineering, KMUTT (2003)'
        ],
        expertise: [
          'Artificial Intelligence',
          'Machine Learning',
          'Deep Learning',
          'Computer Vision',
          'Signal Processing'
        ]
      }
    });
    
    console.log('✅ Updated advisor data successfully');
    console.log('Updated fields:');
    console.log('- Phone Number:', updatedAdvisor.phoneNumber);
    console.log('- Workplace:', updatedAdvisor.workplace);
    console.log('- Department:', updatedAdvisor.department);
    console.log('- Academic Position:', updatedAdvisor.academicPosition);
    console.log('- Short Position:', updatedAdvisor.shortPosition);
    console.log('- Education History:', updatedAdvisor.educationHistory);
    console.log('- Expertise:', updatedAdvisor.expertise);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateAdvisorData(); 