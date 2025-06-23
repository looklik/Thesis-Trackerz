const { PrismaClient } = require('@prisma/client');

async function testAdvisorData() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Testing advisor data completeness...');
    
    // Get all advisors
    const advisors = await prisma.user.findMany({
      where: {
        role: 'teacher'
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        phoneNumber: true,
        workplace: true,
        department: true,
        academicPosition: true,
        shortPosition: true,
        educationHistory: true,
        expertise: true,
        createdAt: true
      }
    });
    
    console.log(`Found ${advisors.length} advisors`);
    
    advisors.forEach((advisor, index) => {
      console.log(`\n--- Advisor ${index + 1}: ${advisor.name} ---`);
      console.log('ID:', advisor.id);
      console.log('Email:', advisor.email);
      console.log('Image:', advisor.image || 'NULL');
      console.log('Phone Number:', advisor.phoneNumber || 'NULL');
      console.log('Workplace:', advisor.workplace || 'NULL');
      console.log('Department:', advisor.department || 'NULL');
      console.log('Academic Position:', advisor.academicPosition || 'NULL');
      console.log('Short Position:', advisor.shortPosition || 'NULL');
      console.log('Education History:', advisor.educationHistory || 'NULL');
      console.log('Expertise:', advisor.expertise || 'NULL');
      console.log('Created At:', advisor.createdAt);
      
      // Check which fields are missing
      const missingFields = [];
      if (!advisor.phoneNumber) missingFields.push('phoneNumber');
      if (!advisor.workplace) missingFields.push('workplace');
      if (!advisor.department) missingFields.push('department');
      if (!advisor.academicPosition) missingFields.push('academicPosition');
      if (!advisor.shortPosition) missingFields.push('shortPosition');
      if (!advisor.educationHistory || advisor.educationHistory.length === 0) missingFields.push('educationHistory');
      if (!advisor.expertise || advisor.expertise.length === 0) missingFields.push('expertise');
      
      if (missingFields.length > 0) {
        console.log('⚠️  Missing fields:', missingFields.join(', '));
      } else {
        console.log('✅ All fields complete');
      }
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAdvisorData(); 