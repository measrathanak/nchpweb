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

  // Create sample users
  const user1 = await prisma.user.upsert({
    where: { email: 'demo@npch.local' },
    update: { password: demoPassword },
    create: {
      email: 'demo@npch.local',
      name: 'Demo User',
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

  console.log('✓ Created demo users:', user1.email, user2.email);

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
