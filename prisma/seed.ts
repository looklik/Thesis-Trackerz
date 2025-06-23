import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding database...');
  
  // Clear existing data (for testing only, remove in production)
  await prisma.task.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.document.deleteMany({});
  await prisma.thesis.deleteMany({});
  await prisma.account.deleteMany({});
  await prisma.user.deleteMany({});
  
  console.log('Cleared existing data');
  
  // Create users: 2 students, 2 advisors
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  // Create student users
  const student1 = await prisma.user.create({
    data: {
      name: 'Student One',
      email: 'student1@example.com',
      password: hashedPassword,
      role: 'student',
      studentId: '6101234567',
      department: 'Computer Engineering',
      phoneNumber: '0812345678',
      status: 'active',
    },
  });
  
  const student2 = await prisma.user.create({
    data: {
      name: 'Student Two',
      email: 'student2@example.com',
      password: hashedPassword,
      role: 'student',
      studentId: '6107654321',
      department: 'Computer Engineering',
      phoneNumber: '0898765432',
      status: 'active',
    },
  });
  
  console.log('Created student users');
  
  // Create advisor users
  const advisor1 = await prisma.user.create({
    data: {
      name: 'Advisor One',
      email: 'advisor1@example.com',
      password: hashedPassword,
      role: 'advisor',
      academicPosition: 'Assoc. Prof.',
      department: 'Computer Engineering',
      workplace: 'Engineering Building 2, Room 201',
      phoneNumber: '0823456789',
      expertise: ['Computer Networks', 'Cybersecurity'],
      educationHistory: ['Ph.D. in Computer Science, MIT', 'M.Eng. in Computer Engineering, Stanford'],
      status: 'active',
    },
  });
  
  const advisor2 = await prisma.user.create({
    data: {
      name: 'Advisor Two',
      email: 'advisor2@example.com',
      password: hashedPassword,
      role: 'advisor',
      academicPosition: 'Asst. Prof.',
      department: 'Computer Engineering',
      workplace: 'Engineering Building 2, Room 202',
      phoneNumber: '0834567890',
      expertise: ['Machine Learning', 'Computer Vision'],
      educationHistory: ['Ph.D. in Computer Science, Berkeley', 'M.Eng. in Computer Engineering, CMU'],
      status: 'active',
    },
  });
  
  console.log('Created advisor users');
  
  // Create theses
  const thesis1 = await prisma.thesis.create({
    data: {
      title: 'Development of a Smart Monitoring System for IoT Devices',
      description: 'A thesis focused on creating an efficient monitoring system for IoT devices using machine learning algorithms.',
      type: 'thesis',
      field: 'Computer Engineering',
      status: 'in_progress',
      student: {
        connect: { id: student1.id },
      },
      advisor: {
        connect: { id: advisor1.id },
      },
      coAdvisor: {
        connect: { id: advisor2.id },
      },
      mainAdvisorConfirmed: true,
      coAdvisorConfirmed: true,
    },
  });
  
  const thesis2 = await prisma.thesis.create({
    data: {
      title: 'Machine Learning Approaches for Network Security',
      description: 'This thesis explores various machine learning techniques to enhance network security and detect intrusions.',
      type: 'thesis',
      field: 'Computer Engineering',
      status: 'in_progress',
      student: {
        connect: { id: student2.id },
      },
      advisor: {
        connect: { id: advisor2.id },
      },
      mainAdvisorConfirmed: true,
      coAdvisorConfirmed: false,
    },
  });
  
  console.log('Created theses');
  
  // Create documents
  await prisma.document.create({
    data: {
      name: 'Thesis Proposal',
      fileUrl: 'https://example.com/documents/proposal1.pdf',
      fileType: 'application/pdf',
      size: 1024000,
      description: 'Initial thesis proposal document',
      version: 1,
      thesis: {
        connect: { id: thesis1.id },
      },
      uploadedBy: student1.id,
    },
  });
  
  await prisma.document.create({
    data: {
      name: 'Literature Review',
      fileUrl: 'https://example.com/documents/literature_review1.pdf',
      fileType: 'application/pdf',
      size: 2048000,
      description: 'Review of existing literature',
      version: 1,
      thesis: {
        connect: { id: thesis1.id },
      },
      uploadedBy: student1.id,
    },
  });
  
  console.log('Created documents');
  
  // Create tasks for student1
  const now = new Date();
  const oneWeekLater = new Date(now);
  oneWeekLater.setDate(now.getDate() + 7);
  
  const twoWeeksLater = new Date(now);
  twoWeeksLater.setDate(now.getDate() + 14);
  
  const threeDaysLater = new Date(now);
  threeDaysLater.setDate(now.getDate() + 3);
  
  await prisma.task.create({
    data: {
      title: 'Complete Literature Review',
      description: 'Finish writing the literature review chapter',
      dueDate: oneWeekLater,
      priority: 'high',
      category: 'documentation',
      completed: false,
      student: {
        connect: { id: student1.id },
      },
      thesis: {
        connect: { id: thesis1.id },
      },
    },
  });
  
  await prisma.task.create({
    data: {
      title: 'Implement Data Collection Module',
      description: 'Create the code to collect data from IoT devices',
      dueDate: twoWeeksLater,
      priority: 'medium',
      category: 'research',
      completed: false,
      student: {
        connect: { id: student1.id },
      },
      thesis: {
        connect: { id: thesis1.id },
      },
    },
  });
  
  await prisma.task.create({
    data: {
      title: 'Schedule Meeting with Advisor',
      description: 'Arrange a meeting to discuss research progress',
      dueDate: threeDaysLater,
      priority: 'high',
      category: 'meeting',
      completed: true,
      student: {
        connect: { id: student1.id },
      },
      thesis: {
        connect: { id: thesis1.id },
      },
    },
  });
  
  // Create tasks for student2
  await prisma.task.create({
    data: {
      title: 'Gather Dataset for ML Model',
      description: 'Collect and preprocess network traffic dataset',
      dueDate: oneWeekLater,
      priority: 'high',
      category: 'research',
      completed: false,
      student: {
        connect: { id: student2.id },
      },
      thesis: {
        connect: { id: thesis2.id },
      },
    },
  });
  
  await prisma.task.create({
    data: {
      title: 'Write Research Methodology',
      description: 'Document the research methodology chapter',
      dueDate: twoWeeksLater,
      priority: 'medium',
      category: 'documentation',
      completed: false,
      student: {
        connect: { id: student2.id },
      },
      thesis: {
        connect: { id: thesis2.id },
      },
    },
  });
  
  console.log('Created tasks');
  
  // Create notifications
  await prisma.notification.create({
    data: {
      title: 'Document Feedback',
      message: 'Your advisor has provided feedback on your thesis proposal',
      type: 'feedback',
      read: false,
      user: {
        connect: { id: student1.id },
      },
      thesis: {
        connect: { id: thesis1.id },
      },
      link: '/student/documents',
    },
  });
  
  await prisma.notification.create({
    data: {
      title: 'Upcoming Meeting',
      message: 'You have a meeting with your advisor tomorrow at 2:00 PM',
      type: 'meeting',
      read: false,
      user: {
        connect: { id: student1.id },
      },
      thesis: {
        connect: { id: thesis1.id },
      },
      link: '/student/calendar',
    },
  });
  
  await prisma.notification.create({
    data: {
      title: 'Task Due Soon',
      message: 'Your "Complete Literature Review" task is due in 7 days',
      type: 'deadline',
      read: false,
      user: {
        connect: { id: student1.id },
      },
      thesis: {
        connect: { id: thesis1.id },
      },
      link: '/student/tasks',
    },
  });
  
  console.log('Created notifications');
  
  console.log('Seeding finished successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 