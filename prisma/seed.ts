// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // ────────────────────────────────────────────────
  // Clean existing data (careful: only for dev!)
  // Comment out if you don't want to wipe the DB
  // ────────────────────────────────────────────────
  await prisma.nudge.deleteMany({});
  await prisma.habitShare.deleteMany({});
  await prisma.checkIn.deleteMany({});
  await prisma.habit.deleteMany({});
  await prisma.friendship.deleteMany({});
  await prisma.account.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.user.deleteMany({});

  // ────────────────────────────────────────────────
  // Hash passwords once (we'll use the same for simplicity)
  // In real app, never store plain passwords!
  // ────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('password123', 10); // change this in production

  // ────────────────────────────────────────────────
  // Create Users with passwords
  // ────────────────────────────────────────────────
  const biniyam = await prisma.user.create({
    data: {
      id: 'user-biniyam-001',
      email: 'biniyam@example.com',
      name: 'Biniyam',
      username: 'biniyam_et',
      image: 'https://example.com/avatars/biniyam.jpg',
      password: passwordHash,
    },
  });

  const selam = await prisma.user.create({
    data: {
      id: 'user-selam-002',
      email: 'selam@example.com',
      name: 'Selam',
      username: 'selam_addis',
      image: 'https://example.com/avatars/selam.jpg',
      password: passwordHash,
    },
  });

  const dawit = await prisma.user.create({
    data: {
      id: 'user-dawit-003',
      email: 'dawit@example.com',
      name: 'Dawit',
      username: 'dawit_code',
      image: 'https://example.com/avatars/dawit.jpg',
      password: passwordHash,
    },
  });

  console.log(`Created users with passwords: ${biniyam.name}, ${selam.name}, ${dawit.name}`);

  // ────────────────────────────────────────────────
  // Friendships (mutual)
  // ────────────────────────────────────────────────
  await prisma.friendship.createMany({
    data: [
      // Biniyam ↔ Selam
      { userId: biniyam.id, friendId: selam.id, status: 'ACCEPTED' },
      { userId: selam.id, friendId: biniyam.id, status: 'ACCEPTED' },
      // Biniyam ↔ Dawit
      { userId: biniyam.id, friendId: dawit.id, status: 'ACCEPTED' },
      { userId: dawit.id, friendId: biniyam.id, status: 'ACCEPTED' },
    ],
    skipDuplicates: true,
  });

  console.log('Friendships created');

  // ────────────────────────────────────────────────
  // Habits for Biniyam
  // ────────────────────────────────────────────────
  await prisma.habit.createMany({
    data: [
      {
        id: 'habit-b1',
        userId: biniyam.id,
        name: 'Code for 1 hour',
        description: 'Daily coding practice - Next.js project',
        frequency: 'daily',
        reminderTime: '19:00',
        icon: '💻',
        color: '#4F46E5',
      },
      {
        id: 'habit-b2',
        userId: biniyam.id,
        name: 'Morning walk in Piassa',
        description: '30 min walk to avoid traffic stress',
        frequency: 'daily',
        reminderTime: '06:30',
        icon: '🚶‍♂️',
        color: '#10B981',
      },
      {
        id: 'habit-b3',
        userId: biniyam.id,
        name: 'Read Ethiopian news',
        description: 'Stay updated - Addis Standard / EBC',
        frequency: 'daily',
        reminderTime: '08:00',
        icon: '📰',
        color: '#F59E0B',
      },
    ],
    skipDuplicates: true,
  });

  // ────────────────────────────────────────────────
  // Some check-ins (last 10 days – mostly completed)
  // ────────────────────────────────────────────────
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 10; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);

    await prisma.checkIn.createMany({
      data: [
        { habitId: 'habit-b1', date, completed: i % 3 !== 2 }, // miss every 3rd day
        { habitId: 'habit-b2', date, completed: true },
        { habitId: 'habit-b3', date, completed: i !== 4 }, // missed one day
      ],
      skipDuplicates: true,
    });
  }

  console.log('Habits & check-ins for Biniyam created');

  // ────────────────────────────────────────────────
  // Share some habits with friends
  // ────────────────────────────────────────────────
  await prisma.habitShare.createMany({
    data: [
      // Biniyam shares coding habit with Selam
      {
        habitId: 'habit-b1',
        sharedWithId: selam.id,
        canSeeStats: true,
        canNudge: true,
      },
      // Biniyam shares walk habit with Dawit
      {
        habitId: 'habit-b2',
        sharedWithId: dawit.id,
        canSeeStats: true,
        canNudge: false,
      },
    ],
    skipDuplicates: true,
  });

  console.log('Habit shares created');

  // ────────────────────────────────────────────────
  // Sample nudges
  // ────────────────────────────────────────────────
  await prisma.nudge.createMany({
    data: [
      {
        senderId: selam.id,
        receiverId: biniyam.id,
        habitId: 'habit-b1',
        message: 'Great streak on coding! Keep it up 💪',
        type: 'STREAK_MILESTONE',
        read: false,
      },
      {
        senderId: dawit.id,
        receiverId: biniyam.id,
        habitId: null,
        message: 'Missed yesterday’s walk? No worries, restart today!',
        type: 'MISSED_DAY',
        read: true,
      },
    ],
    skipDuplicates: true,
  });

  console.log('Sample nudges created');

  console.log('🌱 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });