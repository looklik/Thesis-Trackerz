const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixEventsFinal() {
  try {
    console.log('Final fix for events system...');
    
    // Step 1: Clear all existing events
    console.log('Clearing existing events...');
    await prisma.event.deleteMany({});
    console.log('All events cleared');
    
    // Step 2: Find student and teacher
    const student = await prisma.user.findFirst({
      where: { name: 'Dy MAHASUP' },
      include: { theses: true }
    });
    
    const teacher = await prisma.user.findFirst({
      where: { role: 'teacher' }
    });
    
    if (!student || !teacher || !student.theses[0]) {
      console.log('Required data not found');
      return;
    }
    
    const thesis = student.theses[0];
    console.log('Found:', {
      student: student.name,
      teacher: teacher.name,
      thesis: thesis.title
    });
    
    // Step 3: Create events without milestoneId
    const now = new Date();
    const events = [
      {
        title: 'Thesis Defense Presentation',
        description: 'Final thesis defense presentation',
        startTime: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
        endTime: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
        type: 'presentation',
        status: 'scheduled',
        allDay: false,
        thesisId: thesis.id,
        creatorId: teacher.id,
        reminderSent: false
      },
      {
        title: 'Progress Review Meeting',
        description: 'Monthly progress review with advisor',
        startTime: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        endTime: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000),
        type: 'meeting',
        status: 'scheduled',
        allDay: false,
        thesisId: thesis.id,
        creatorId: teacher.id,
        reminderSent: false
      },
      {
        title: 'Data Collection Milestone',
        description: 'Complete data collection phase',
        startTime: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        endTime: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        type: 'milestone',
        status: 'scheduled',
        allDay: true,
        thesisId: thesis.id,
        creatorId: teacher.id,
        reminderSent: false
      }
    ];
    
    console.log('Creating events...');
    for (const eventData of events) {
      try {
        const event = await prisma.event.create({
          data: eventData
        });
        console.log(`Created: ${event.title}`);
      } catch (error) {
        console.log(`Failed to create ${eventData.title}:`, error.message);
      }
    }
    
    // Step 4: Verify events were created
    const createdEvents = await prisma.event.findMany({
      where: { thesisId: thesis.id },
      orderBy: { startTime: 'asc' }
    });
    
    console.log('\nFinal Results:');
    console.log(`Total events created: ${createdEvents.length}`);
    createdEvents.forEach(event => {
      console.log(`- [${event.type.toUpperCase()}] ${event.title} (${event.status})`);
    });
    
    console.log('\nEvents system fixed successfully!');
    console.log('Next steps:');
    console.log('1. Refresh the Student Detail page');
    console.log('2. Check the Events tab');
    console.log('3. Events should now appear properly');
    
  } catch (error) {
    console.error('Error fixing events:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixEventsFinal(); 