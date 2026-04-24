import { redirect } from 'next/navigation';
import { Locale } from '@/lib/i18n';
import { auth } from '@/auth';
import prisma from '@/lib/db';
import ManagementPageShell from '@/components/layout/ManagementPageShell';
import { getUserRole, hasRoleAccess } from '@/lib/auth/roles';
import { protectedRouteRolePolicy } from '@/lib/auth/protected-routes';
import LanguagesTable from '@/components/settings/LanguagesTable';

interface LanguagesPageProps {
  params: Promise<{ locale: string }>;
}

export default async function LanguagesPage({ params }: LanguagesPageProps) {
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

  const languages = await prisma.language.findMany({ orderBy: { sortOrder: 'asc' } });

  return (
    <ManagementPageShell
      title={localeValue === 'km' ? 'ភាសា' : 'Languages'}
      subtitle={localeValue === 'km' ? 'គ្រប់គ្រងភាសាដែលមាន។' : 'Manage available languages.'}
      main={<LanguagesTable initial={languages} />}
    />
  );
}
