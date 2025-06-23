const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testAdvisorAPI() {
  try {
    const studentId = '684c5fa5d827689a753705d8';
    
    console.log('🔍 Testing Student Dashboard API - Advisor Data...');
    console.log('🔍 Student ID:', studentId);

    // Simulate the exact API call from student dashboard
    const thesis = await prisma.thesis.findFirst({
      where: { studentId: studentId },
      include: {
        advisor: {
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
        },
        coAdvisor: {
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
        }
      }
    });

    if (!thesis) {
      console.log('❌ No thesis found for student');
      return;
    }

    console.log('\n📊 Thesis Data:');
    console.log('- Thesis ID:', thesis.id);
    console.log('- Title:', thesis.title);

    // Check advisor data
    if (thesis.advisor) {
      console.log('\n👨‍🏫 Main Advisor Data:');
      console.log('- ID:', thesis.advisor.id);
      console.log('- Name:', thesis.advisor.name);
      console.log('- Email:', thesis.advisor.email);
      console.log('- Image:', thesis.advisor.image || 'No image');
      console.log('- Phone:', thesis.advisor.phoneNumber || 'No phone');
      console.log('- Workplace:', thesis.advisor.workplace || 'No workplace');
      console.log('- Department:', thesis.advisor.department || 'No department');
      console.log('- Academic Position:', thesis.advisor.academicPosition || 'No position');
      console.log('- Short Position:', thesis.advisor.shortPosition || 'No short position');
      console.log('- Education History:', thesis.advisor.educationHistory || 'No education history');
      console.log('- Expertise:', thesis.advisor.expertise || 'No expertise');
      console.log('- Created At:', thesis.advisor.createdAt);
    } else {
      console.log('\n❌ No main advisor found');
    }

    // Check co-advisor data
    if (thesis.coAdvisor) {
      console.log('\n👨‍🏫 Co-Advisor Data:');
      console.log('- ID:', thesis.coAdvisor.id);
      console.log('- Name:', thesis.coAdvisor.name);
      console.log('- Email:', thesis.coAdvisor.email);
      console.log('- Image:', thesis.coAdvisor.image || 'No image');
      console.log('- Phone:', thesis.coAdvisor.phoneNumber || 'No phone');
      console.log('- Workplace:', thesis.coAdvisor.workplace || 'No workplace');
      console.log('- Department:', thesis.coAdvisor.department || 'No department');
      console.log('- Academic Position:', thesis.coAdvisor.academicPosition || 'No position');
      console.log('- Short Position:', thesis.coAdvisor.shortPosition || 'No short position');
      console.log('- Education History:', thesis.coAdvisor.educationHistory || 'No education history');
      console.log('- Expertise:', thesis.coAdvisor.expertise || 'No expertise');
      console.log('- Created At:', thesis.coAdvisor.createdAt);
    } else {
      console.log('\n❌ No co-advisor found');
    }

    // Create advisors array like the API does
    const advisors = [];
    if (thesis.advisor) {
      advisors.push({
        ...thesis.advisor,
        role: 'Main Advisor'
      });
    }
    if (thesis.coAdvisor) {
      advisors.push({
        ...thesis.coAdvisor,
        role: 'Co-Advisor'
      });
    }

    console.log('\n📋 Final Advisors Array:');
    console.log('- Total advisors:', advisors.length);
    advisors.forEach((advisor, index) => {
      console.log(`\nAdvisor ${index + 1}:`);
      console.log('- Name:', advisor.name);
      console.log('- Role:', advisor.role);
      console.log('- Email:', advisor.email);
      console.log('- Has all fields:', {
        phoneNumber: !!advisor.phoneNumber,
        workplace: !!advisor.workplace,
        department: !!advisor.department,
        academicPosition: !!advisor.academicPosition,
        shortPosition: !!advisor.shortPosition,
        educationHistory: !!advisor.educationHistory,
        expertise: !!advisor.expertise
      });
    });

  } catch (error) {
    console.error('❌ Error testing advisor API:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAdvisorAPI(); 