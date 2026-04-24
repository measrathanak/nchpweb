import { redirect } from 'next/navigation';
import { Locale } from '@/lib/i18n';
import { auth } from '@/auth';
import prisma from '@/lib/db';
import ManagementPageShell from '@/components/layout/ManagementPageShell';
import { getUserRole, hasRoleAccess } from '@/lib/auth/roles';
import { protectedRouteRolePolicy } from '@/lib/auth/protected-routes';
import RoleUserPanel from '@/components/roles/RoleUserPanel';

interface RoleUserPageProps {
  params: Promise<{ locale: string }>;
}

export default async function RoleUserPage({ params }: RoleUserPageProps) {
  const { locale } = await params;
  const localeValue = locale as Locale;
  const session = await auth();

  if (!session?.user?.email) {
    redirect(`/${localeValue}/auth/signin`);
  }

  const requiredRole = protectedRouteRolePolicy.roles;
  const role = getUserRole(session.user.email);

  if (!hasRoleAccess(role, requiredRole)) {
    redirect(`/${localeValue}/forbidden`);
  }

  const [roles, users] = await Promise.all([
    prisma.role.findMany({ orderBy: { name: 'asc' } }),
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, name: true, firstName: true, lastName: true },
    }),
  ]);

  return (
    <ManagementPageShell
      title={localeValue === 'km' ? 'អ្នកប្រើប្រាស់តួនាទី' : 'Role User'}
      subtitle={localeValue === 'km' ? 'គ្រប់គ្រងអ្នកប្រើប្រាស់សម្រាប់តួនាទីនីមួយៗ។' : 'Manage users assigned to each role.'}
      main={<RoleUserPanel roles={roles} users={users} />}
    />
  );
}
