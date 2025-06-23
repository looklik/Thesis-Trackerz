const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDashboardLogic() {
  try {
    console.log('🔍 Testing dashboard logic...');
    
    // จำลองการทำงานของ dashboard API
    const studentId = '6820fd13ae17f693551e7670'; // Student ID ที่เราเห็นจากข้อมูล
    
    console.log(`👤 Testing for student: ${studentId}`);
    
    // Get student's thesis
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
        },
        documents: {
          select: {
            id: true,
            name: true,
            status: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        calendarEvents: {
          select: {
            id: true,
            title: true,
            description: true,
            date: true,
            time: true,
            type: true,
            createdAt: true
          },
          orderBy: { date: 'asc' }
        }
      }
    });
    
    if (!thesis) {
      console.log('❌ No thesis found for student');
      return;
    }
    
    console.log(`📚 Found thesis: ${thesis.title}`);
    console.log(`📄 Documents: ${thesis.documents.length}`);
    console.log(`📅 Calendar Events: ${thesis.calendarEvents.length}`);
    
    // Get pending document reviews
    const pendingReviews = await prisma.document.count({
      where: {
        thesisId: thesis.id,
        status: 'pending'
      }
    });
    
    console.log(`⏳ Pending reviews: ${pendingReviews}`);
    
    // Get upcoming calendar events (next 30 days)
    const now = new Date();
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    
    console.log(`📅 Current date: ${now.toISOString()}`);
    console.log(`📅 30 days from now: ${thirtyDaysFromNow.toISOString()}`);
    
    const upcomingCalendarEvents = thesis.calendarEvents.filter(event => {
      if (!event.date) return false;
      const eventDate = new Date(event.date);
      const isUpcoming = eventDate > now && eventDate <= thirtyDaysFromNow;
      console.log(`  📅 ${event.title}: ${event.date} -> ${isUpcoming ? 'UPCOMING' : 'NOT UPCOMING'}`);
      return isUpcoming;
    });

    // Total upcoming deadlines = calendar events only (no more milestones)
    const totalUpcomingDeadlines = upcomingCalendarEvents.length;
    
    console.log(`🔮 Upcoming calendar events count: ${upcomingCalendarEvents.length}`);
    console.log(`🔮 Total upcoming deadlines: ${totalUpcomingDeadlines}`);

    // Calculate statistics
    const stats = {
      thesisProgress: thesis.progress || 0,
      documentsSubmitted: thesis.documents.length,
      pendingReviews: pendingReviews,
      upcomingDeadlines: totalUpcomingDeadlines
    };
    
    console.log('\n📊 Final Dashboard Stats:');
    console.log(JSON.stringify(stats, null, 2));
    
  } catch (error) {
    console.error('❌ Error testing dashboard logic:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDashboardLogic(); 