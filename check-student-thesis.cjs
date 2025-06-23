const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkStudentThesis() {
  try {
    console.log('🔍 Checking students and theses...');
    
    // ดู students ทั้งหมด
    const students = await prisma.user.findMany({
      where: { role: 'student' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });
    
    console.log(`👥 Found ${students.length} students:`);
    students.forEach((student, index) => {
      console.log(`${index + 1}. ${student.name} (${student.email}) - ID: ${student.id}`);
    });
    
    // ดู theses ทั้งหมด
    const theses = await prisma.thesis.findMany({
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        calendarEvents: true
      }
    });
    
    console.log(`\n📚 Found ${theses.length} theses:`);
    theses.forEach((thesis, index) => {
      console.log(`${index + 1}. ${thesis.title}`);
      console.log(`   Student: ${thesis.student?.name} (ID: ${thesis.studentId})`);
      console.log(`   Calendar Events: ${thesis.calendarEvents.length}`);
      console.log('');
    });
    
    // ตรวจสอบความสัมพันธ์
    if (theses.length > 0) {
      const firstThesis = theses[0];
      console.log(`🔍 Testing with first thesis (Student ID: ${firstThesis.studentId}):`);
      
      // ทดสอบ logic ของ dashboard
      const now = new Date();
      const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      
      const upcomingEvents = firstThesis.calendarEvents.filter(event => {
        if (!event.date) return false;
        const eventDate = new Date(event.date);
        return eventDate > now && eventDate <= thirtyDaysFromNow;
      });
      
      console.log(`📅 Upcoming events for this thesis: ${upcomingEvents.length}`);
      upcomingEvents.forEach((event, index) => {
        console.log(`  ${index + 1}. ${event.title} - ${event.date}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking student thesis:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkStudentThesis(); 