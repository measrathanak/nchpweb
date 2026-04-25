/**
 * Prisma Seed Script
 * Populates the database with initial data
 */

import "dotenv/config";
import bcrypt from 'bcryptjs';
import prisma from '../src/lib/db/index';

const PERMISSIONS = [
  'dashboard.view',
  'users.view',
  'users.create',
  'users.edit',
  'users.delete',
  'users.reset_password',
  'users.assign_role',
  'users.assign_permission',
  'roles.view',
  'roles.create',
  'roles.edit',
  'roles.delete',
  'articles.view',
  'articles.create',
  'articles.edit',
  'articles.delete',
  'articles.publish',
  'settings.view',
  'settings.manage_languages',
  'settings.manage_profile',
  'profile.view',
  'profile.edit',
  'profile.change_password',
];

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

  const createdDmsUsers: Record<string, { id: string; email: string }> = {};
  for (const u of dmsUsers) {
    const created = await prisma.user.upsert({
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
    createdDmsUsers[u.email] = { id: created.id, email: created.email };
  }

  console.log('✓ Created demo users:', user1.email, user2.email);
  console.log('✓ Created DMS users:', dmsUsers.map((u) => u.email).join(', '));

  // Create sample roles
  const roleFixtures = [
    { name: 'Super Admin', permissions: PERMISSIONS },
    {
      name: 'Editor',
      permissions: [
        'dashboard.view',
        'articles.view',
        'articles.create',
        'articles.edit',
        'articles.publish',
        'profile.view',
        'profile.edit',
      ],
    },
    {
      name: 'Reporter',
      permissions: [
        'dashboard.view',
        'articles.view',
        'articles.create',
        'articles.edit',
        'profile.view',
      ],
    },
    {
      name: 'Viewer',
      permissions: [
        'dashboard.view',
        'articles.view',
        'users.view',
        'roles.view',
        'settings.view',
        'profile.view',
      ],
    },
  ];

  const rolesByName = new Map<string, { id: string; name: string }>();
  for (const role of roleFixtures) {
    const createdRole = await prisma.role.upsert({
      where: { name: role.name },
      update: { permissions: role.permissions },
      create: { name: role.name, permissions: role.permissions },
    });
    rolesByName.set(createdRole.name, { id: createdRole.id, name: createdRole.name });
  }
  console.log('✓ Created sample roles:', roleFixtures.map((r) => r.name).join(', '));

  // Assign roles to users
  const assignmentRows = [
    { userId: user1.id, roleId: rolesByName.get('Editor')?.id },
    { userId: user2.id, roleId: rolesByName.get('Viewer')?.id },
    { userId: createdDmsUsers['admin@dms.com']?.id, roleId: rolesByName.get('Super Admin')?.id },
    { userId: createdDmsUsers['dara.pich@dms.com']?.id, roleId: rolesByName.get('Editor')?.id },
    { userId: createdDmsUsers['sokha.chan@dms.com']?.id, roleId: rolesByName.get('Reporter')?.id },
    { userId: createdDmsUsers['virak.heng@dms.com']?.id, roleId: rolesByName.get('Viewer')?.id },
    { userId: createdDmsUsers['sreymom.keo@dms.com']?.id, roleId: rolesByName.get('Viewer')?.id },
  ].filter((row): row is { userId: string; roleId: string } => Boolean(row.userId && row.roleId));

  await prisma.userRoleAssignment.createMany({
    data: assignmentRows,
    skipDuplicates: true,
  });
  console.log('✓ Created sample role assignments');

  // Create sample languages
  const languageFixtures = [
    { code: 'en', name: 'English', nativeName: 'English', flagEmoji: '/icons/flags/en.png', sortOrder: 1, enabled: true },
    { code: 'km', name: 'Khmer', nativeName: 'ខ្មែរ', flagEmoji: '/icons/flags/km.png', sortOrder: 2, enabled: true },
    { code: 'zh', name: 'Chinese', nativeName: '中文', flagEmoji: '/icons/flags/zh.png', sortOrder: 3, enabled: true },
    { code: 'fr', name: 'French', nativeName: 'Français', flagEmoji: '/icons/flags/fr.png', sortOrder: 4, enabled: false },
  ];

  for (const lang of languageFixtures) {
    await prisma.language.upsert({
      where: { code: lang.code },
      update: {
        name: lang.name,
        nativeName: lang.nativeName,
        flagEmoji: lang.flagEmoji,
        sortOrder: lang.sortOrder,
        enabled: lang.enabled,
      },
      create: lang,
    });
  }
  console.log('✓ Created sample languages');

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
      {
        userId: user1.id,
        typo3ArticleUid: 3,
        title: 'Policy Update 2026',
        slug: 'policy-update-2026',
        language: 'en',
      },
      {
        userId: createdDmsUsers['dara.pich@dms.com']?.id ?? user1.id,
        typo3ArticleUid: 4,
        title: 'Document Retention Best Practices',
        slug: 'document-retention-best-practices',
        language: 'en',
      },
    ],
    skipDuplicates: true,
  });

  console.log('✓ Created sample saved articles');

  // Create sample form submissions
  await prisma.formSubmission.createMany({
    data: [
      {
        formType: 'contact',
        email: 'visitor@example.com',
        name: 'Test Visitor',
        formData: {
          message: 'This is a test contact form submission',
          subject: 'Website Inquiry',
        },
      },
      {
        formType: 'feedback',
        email: 'reader@example.com',
        name: 'Reader Feedback',
        status: 'reviewed',
        notes: 'Assigned to editorial team',
        formData: {
          message: 'Great experience with multilingual content.',
          rating: 5,
        },
      },
      {
        formType: 'newsletter',
        email: 'newsletter@example.com',
        name: 'Newsletter Signup',
        status: 'resolved',
        formData: {
          source: 'homepage',
          frequency: 'weekly',
        },
      },
    ],
  });

  console.log('✓ Created sample form submissions');

  // Create sample search cache
  await prisma.searchCache.upsert({
    where: { query_language: { query: 'climate', language: 'en' } },
    update: {
      resultCount: 3,
      hits: 5,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60),
      results: {
        items: [
          { uid: 101, title: 'Climate Action Plan' },
          { uid: 102, title: 'Green Energy Investment' },
          { uid: 103, title: 'Carbon Neutrality Roadmap' },
        ],
      },
    },
    create: {
      query: 'climate',
      language: 'en',
      resultCount: 3,
      hits: 5,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60),
      results: {
        items: [
          { uid: 101, title: 'Climate Action Plan' },
          { uid: 102, title: 'Green Energy Investment' },
          { uid: 103, title: 'Carbon Neutrality Roadmap' },
        ],
      },
    },
  });

  // Create sample page views
  await prisma.pageView.createMany({
    data: [
      { userId: user1.id, path: '/en', title: 'Home', referrer: 'https://google.com', language: 'en', loadTime: 320 },
      { userId: user2.id, path: '/km/articles', title: 'អត្ថបទ', referrer: 'https://facebook.com', language: 'km', loadTime: 410 },
      { path: '/en/login', title: 'Sign In', language: 'en', loadTime: 280 },
      { userId: createdDmsUsers['dara.pich@dms.com']?.id, path: '/en/users', title: 'Users', language: 'en', loadTime: 365 },
    ],
  });

  // Create sample content queue jobs
  await prisma.contentQueue.createMany({
    data: [
      {
        action: 'cache_article',
        status: 'pending',
        payload: { articleUid: 105, language: 'en' },
      },
      {
        action: 'send_notification',
        status: 'completed',
        attempts: 1,
        payload: { channel: 'email', audience: 'subscribers' },
      },
      {
        action: 'clear_search',
        status: 'failed',
        attempts: 3,
        error: 'Timeout while clearing Solr cache',
        payload: { query: 'climate', language: 'en' },
      },
    ],
  });

  // Intentionally do NOT create LoginAudit fixtures.
  console.log('✓ Skipped Login Audit fixtures by request');

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
