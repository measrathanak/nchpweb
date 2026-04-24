/**
 * Prisma Seed Script
 * Populates the database with initial data
 */

import "dotenv/config";
import bcrypt from 'bcryptjs';
import prisma from '../src/lib/db/index';

async function main() {
  console.log('🌱 Starting database seed...');

  const demoPassword = await bcrypt.hash('demo1234', 10);
  const khmerPassword = await bcrypt.hash('khmer1234', 10);
  const dmsPassword = await bcrypt.hash('dms1234', 10);

  // Create sample users
  const user1 = await prisma.user.upsert({
    where: { email: 'demo@npch.local' },
    update: { password: demoPassword },
    create: {
      email: 'demo@npch.local',
      name: 'Demo User',
      firstName: 'Demo',
      lastName: 'User',
      language: 'en',
      password: demoPassword,
      preferences: {
        create: {
          theme: 'light',
          fontSize: 'medium',
        },
      },
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'khmer@npch.local' },
    update: { password: khmerPassword },
    create: {
      email: 'khmer@npch.local',
      name: 'ប្រើប្រាស់ខ្មែរ',
      firstName: 'ប្រើប្រាស់',
      lastName: 'ខ្មែរ',
      language: 'km',
      password: khmerPassword,
      preferences: {
        create: {
          theme: 'light',
          fontSize: 'medium',
        },
      },
    },
  });

  // Create DMS sample users
  const dmsUsers = [
    { email: 'dara.pich@dms.com', firstName: 'Dara', lastName: 'Pich', phone: '012 567 890' },
    { email: 'sokha.chan@dms.com', firstName: 'Sokha', lastName: 'Chan', phone: '012 456 789' },
    { email: 'admin@dms.com', firstName: 'Admin', lastName: 'User', phone: '012 345 678' },
    { email: 'virak.heng@dms.com', firstName: 'Virak', lastName: 'Heng', phone: '012 789 012' },
    { email: 'sreymom.keo@dms.com', firstName: 'Sreymom', lastName: 'Keo', phone: '012 678 901' },
  ];

  for (const u of dmsUsers) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { firstName: u.firstName, lastName: u.lastName, phone: u.phone },
      create: {
        email: u.email,
        name: `${u.firstName} ${u.lastName}`,
        firstName: u.firstName,
        lastName: u.lastName,
        phone: u.phone,
        language: 'en',
        password: dmsPassword,
      },
    });
  }

  console.log('✓ Created demo users:', user1.email, user2.email);
  console.log('✓ Created DMS users:', dmsUsers.map((u) => u.email).join(', '));

  // Create sample saved articles
  await prisma.savedArticle.createMany({
    data: [
      {
        userId: user1.id,
        typo3ArticleUid: 1,
        title: 'Sample Article 1',
        slug: 'sample-article-1',
        language: 'en',
      },
      {
        userId: user2.id,
        typo3ArticleUid: 2,
        title: 'អត្ថបទគំរូ ២',
        slug: 'sample-article-2',
        language: 'km',
      },
    ],
    skipDuplicates: true,
  });

  console.log('✓ Created sample saved articles');

  // Create sample form submission
  await prisma.formSubmission.create({
    data: {
      formType: 'contact',
      email: 'visitor@example.com',
      name: 'Test Visitor',
      formData: {
        message: 'This is a test contact form submission',
        subject: 'Website Inquiry',
      },
    },
  });

  console.log('✓ Created sample form submission');

  console.log('✅ Database seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
