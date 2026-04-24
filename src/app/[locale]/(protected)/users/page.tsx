import { redirect } from 'next/navigation';
import { Locale } from '@/lib/i18n';
import { auth } from '@/auth';
import prisma from '@/lib/db';
import ManagementPageShell from '@/components/layout/ManagementPageShell';
import { getUserRole, hasRoleAccess } from '@/lib/auth/roles';
import { protectedRouteRolePolicy } from '@/lib/auth/protected-routes';
import UsersTable, { UserRow } from '@/components/users/UsersTable';

interface UsersPageProps {
  params: Promise<{ locale: string }>;
}

export default async function UsersPage({ params }: UsersPageProps) {
  const { locale } = await params;
  const localeValue = locale as Locale;
  const session = await auth();

  if (!session?.user?.email) {
    redirect(`/${localeValue}/auth/signin`);
  }

  const requiredRole = protectedRouteRolePolicy.users;
  const role = getUserRole(session.user.email);

  if (!hasRoleAccess(role, requiredRole)) {
    redirect(`/${localeValue}/forbidden`);
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const userRows: UserRow[] = users.map((u) => ({
    id: u.id,
    email: u.email,
    firstName: u.firstName,
    lastName: u.lastName,
    phone: u.phone,
  }));

  const labels = {
    title: localeValue === 'km' ? 'អ្នកប្រើប្រាស់' : 'Users',
    subtitle:
      localeValue === 'km'
        ? 'គ្រប់គ្រងអ្នកប្រើប្រាស់ និងព័ត៌មានទំនាក់ទំនងក្នុងប្រព័ន្ធ។'
        : 'Manage system users and their contact details.',
  };

  return (
    <ManagementPageShell
      title={labels.title}
      subtitle={labels.subtitle}
      main={<UsersTable initial={userRows} />}
    />
  );
}
