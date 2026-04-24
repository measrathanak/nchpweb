import { redirect } from 'next/navigation';
import { Locale } from '@/lib/i18n';
import { auth } from '@/auth';
import ManagementPageShell from '@/components/layout/ManagementPageShell';
import { getUserRole, hasRoleAccess } from '@/lib/auth/roles';
import { protectedRouteRolePolicy } from '@/lib/auth/protected-routes';
import LoginAuditLogs from '@/components/settings/LoginAuditLogs';

interface LoginAuditsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function LoginAuditsPage({ params }: LoginAuditsPageProps) {
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

  return (
    <ManagementPageShell
      title={localeValue === 'km' ? 'ឯកសារលោការ' : 'Login Audit Logs'}
      subtitle={localeValue === 'km' ? 'មើលលម្អិតពីការចូលប្រើប្រាស់របស់អ្នក។' : 'View detailed login history.'}
      main={<LoginAuditLogs />}
    />
  );
}
