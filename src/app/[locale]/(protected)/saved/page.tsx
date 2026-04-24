import { redirect } from 'next/navigation';
import { Locale } from '@/lib/i18n';
import { auth } from '@/auth';
import prisma from '@/lib/db';
import SavedArticlesList from '@/components/articles/SavedArticlesList';
import GuardAuditPanel from '@/components/debug/GuardAuditPanel';
import { getRoleDetails, getUserRole, hasRoleAccess } from '@/lib/auth/roles';
import { protectedRouteRolePolicy } from '@/lib/auth/protected-routes';

interface SavedPageProps {
  params: Promise<{ locale: string }>;
}

export default async function SavedPage({ params }: SavedPageProps) {
  const { locale } = await params;
  const localeValue = locale as Locale;
  const session = await auth();
  const isDev = process.env.NODE_ENV !== 'production';

  if (!session?.user?.email) {
    redirect(`/${localeValue}/auth/signin`);
  }

  const requiredRole = protectedRouteRolePolicy.saved;
  const role = getUserRole(session.user.email);
  const roleDetails = getRoleDetails(session.user.email);
  const middlewareAuthCheck = true;
  const middlewareRoleCheck = hasRoleAccess(role, requiredRole);
  const pageAuthCheck = true;
  const pageRoleCheck = hasRoleAccess(role, requiredRole);
  const finalAccessDecision = middlewareAuthCheck && middlewareRoleCheck && pageAuthCheck && pageRoleCheck;

  if (!middlewareRoleCheck) {
    redirect(`/${localeValue}/forbidden`);
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      savedArticles: {
        orderBy: { savedAt: 'desc' },
      },
    },
  });

  const savedArticles = user?.savedArticles ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">
          {localeValue === 'km' ? 'អត្ថបទដែលបានរក្សាទុក' : 'Saved Articles'}
        </h1>
        <p className="text-gray-600">
          {localeValue === 'km'
            ? 'បញ្ជីអត្ថបទដែលអ្នកបានរក្សាទុក'
            : 'Articles you have bookmarked'}
        </p>
      </div>

      <SavedArticlesList locale={localeValue} items={savedArticles} />

      {isDev ? (
        <GuardAuditPanel
          locale={localeValue}
          route={`/${localeValue}/saved`}
          email={roleDetails.normalizedEmail}
          role={role}
          roleSource={roleDetails.source}
          requiredRole={requiredRole}
          middlewareAuthCheck={middlewareAuthCheck}
          middlewareRoleCheck={middlewareRoleCheck}
          pageAuthCheck={pageAuthCheck}
          pageRoleCheck={pageRoleCheck}
          finalAccessDecision={finalAccessDecision}
        />
      ) : null}
    </div>
  );
}
