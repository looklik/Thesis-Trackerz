const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addSampleEvents() {
  console.log('Adding sample events for student...');
  
  try {
    // Find the student and thesis
    const student = await prisma.user.findFirst({
      where: { name: 'Dy MAHASUP' },
      include: {
        theses: true
      }
    });
    
    if (!student || !student.theses[0]) {
      console.log('Student or thesis not found');
      return;
    }
    
    const thesis = student.theses[0];
    console.log('Found student:', student.name);
    console.log('Thesis:', thesis.title);
    
    // Find the teacher (advisor)
    const teacher = await prisma.user.findUnique({
      where: { id: thesis.advisorId }
    });
    
    if (!teacher) {
      console.log('Teacher/advisor not found');
      return;
    }
    
    console.log('Teacher:', teacher.name);
    
    // Sample events to add
    const sampleEvents = [
      {
        title: 'Thesis Proposal Presentation',
        description: 'Present thesis proposal to committee',
        startTime: new Date('2024-12-30T10:00:00'),
        endTime: new Date('2024-12-30T12:00:00'),
        type: 'presentation',
        status: 'scheduled'
      },
      {
        title: 'Progress Review Meeting',
        description: 'Monthly progress review with advisor',
        startTime: new Date('2024-12-25T14:00:00'),
        endTime: new Date('2024-12-25T15:00:00'),
        type: 'meeting',
        status: 'scheduled'
      },
      {
        title: 'Literature Review Completion',
        description: 'Complete literature review chapter',
        startTime: new Date('2024-12-20T09:00:00'),
        endTime: new Date('2024-12-20T10:00:00'),
        type: 'milestone',
        status: 'completed'
      },
      {
        title: 'Data Collection Phase',
        description: 'Begin data collection for research',
        startTime: new Date('2025-01-15T08:00:00'),
        endTime: new Date('2025-01-15T09:00:00'),
        type: 'milestone',
        status: 'scheduled'
      },
      {
        title: 'Committee Meeting',
        description: 'Meeting with thesis committee members',
        startTime: new Date('2025-01-05T13:00:00'),
        endTime: new Date('2025-01-05T15:00:00'),
        type: 'meeting',
        status: 'scheduled'
      }
    ];
    
    console.log('\nAdding events...');
    
    for (const eventData of sampleEvents) {
      const event = await prisma.event.create({
        data: {
          ...eventData,
          allDay: false,
          creatorId: teacher.id,
          thesisId: thesis.id,
          reminderSent: false
        }
      });
      
      console.log(`Added: [${event.type.toUpperCase()}] ${event.title} (${event.status})`);
    }
    
    // Check final result
    const finalEvents = await prisma.event.findMany({
      where: { thesisId: thesis.id },
      orderBy: { startTime: 'asc' }
    });
    
    console.log(`\nTotal events for ${student.name}: ${finalEvents.length}`);
    console.log('\nAll events:');
    finalEvents.forEach(event => {
      const date = event.startTime.toLocaleDateString();
      console.log(`- [${event.type.toUpperCase()}] ${event.title} - ${date} (${event.status})`);
    });
    
    console.log('\nSample events added successfully!');
    
  } catch (error) {
    console.error('Error adding sample events:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addSampleEvents(); 