const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkCalendarEvents() {
  try {
    console.log('🔍 Checking CalendarEvent data...');
    
    // นับจำนวน CalendarEvent ทั้งหมด
    const totalEvents = await prisma.calendarEvent.count();
    console.log(`📊 Total CalendarEvents: ${totalEvents}`);
    
    // ดู CalendarEvent ทั้งหมด
    const events = await prisma.calendarEvent.findMany({
      orderBy: { date: 'asc' },
      include: {
        thesis: {
          select: {
            id: true,
            title: true,
            student: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    });
    
    console.log('\n📅 All CalendarEvents:');
    events.forEach((event, index) => {
      console.log(`${index + 1}. ${event.title}`);
      console.log(`   Date: ${event.date} ${event.time}`);
      console.log(`   Type: ${event.type}`);
      console.log(`   Thesis: ${event.thesis?.title || 'No thesis'}`);
      console.log(`   Student: ${event.thesis?.student?.name || 'No student'}`);
      console.log('');
    });
    
    // ตรวจสอบ upcoming events
    const now = new Date();
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    
    const upcomingEvents = events.filter(event => {
      if (!event.date) return false;
      const eventDate = new Date(event.date);
      return eventDate > now && eventDate <= thirtyDaysFromNow;
    });
    
    console.log(`🔮 Upcoming events (next 30 days): ${upcomingEvents.length}`);
    upcomingEvents.forEach((event, index) => {
      console.log(`${index + 1}. ${event.title} - ${event.date}`);
    });
    
    // ตรวจสอบ Thesis ที่มี CalendarEvent
    const thesesWithEvents = await prisma.thesis.findMany({
      include: {
        calendarEvents: true,
        student: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });
    
    console.log('\n🎓 Theses with CalendarEvents:');
    thesesWithEvents.forEach((thesis, index) => {
      console.log(`${index + 1}. ${thesis.title}`);
      console.log(`   Student: ${thesis.student?.name}`);
      console.log(`   Events: ${thesis.calendarEvents.length}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error checking CalendarEvents:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCalendarEvents(); 