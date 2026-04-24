import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Locale } from '@/lib/i18n';
import { auth } from '@/auth';
import prisma from '@/lib/db';
import { getRoleDetails, hasRoleAccess, getUserRole } from '@/lib/auth/roles';
import { protectedRouteRolePolicy } from '@/lib/auth/protected-routes';
import GuardAuditPanel from '@/components/debug/GuardAuditPanel';

interface DashboardPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    tab?: string;
    q?: string;
    storage?: string;
  }>;
}

export default async function DashboardPage({ params, searchParams }: DashboardPageProps) {
  const { locale } = await params;
  const { tab = 'all', q = '', storage = 'all' } = await searchParams;
  const localeValue = locale as Locale;
  const session = await auth();
  const isDev = process.env.NODE_ENV !== 'production';
  const requiredRole = protectedRouteRolePolicy.dashboard;
  const role = getUserRole(session?.user?.email ?? null);
  const roleDetails = getRoleDetails(session?.user?.email ?? null);

  const middlewareAuthCheck = Boolean(session?.user?.email);
  const middlewareRoleCheck = hasRoleAccess(role, requiredRole);
  const pageAuthCheck = middlewareAuthCheck;
  const pageRoleCheck = hasRoleAccess(role, requiredRole);
  const finalAccessDecision = middlewareAuthCheck && middlewareRoleCheck && pageAuthCheck && pageRoleCheck;

  if (!middlewareAuthCheck) {
    redirect(`/${localeValue}/auth/signin`);
  }

  if (!middlewareRoleCheck) {
    redirect(`/${localeValue}/forbidden`);
  }

  const savedArticles = await prisma.savedArticle.findMany({
    where: {
      user: { email: session?.user?.email ?? '' },
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { slug: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(tab === 'incoming' ? { language: 'en' } : {}),
      ...(tab === 'outgoing' ? { language: 'km' } : {}),
    },
    orderBy: { savedAt: 'desc' },
  });

  const t = {
    en: {
      title: 'All Documents',
      tabs: {
        all: 'All Documents',
        incoming: 'Incoming',
        outgoing: 'Outgoing',
        internal: 'Internal_Documents',
      },
      addDocument: '+ Add Document',
      searchName: 'Search by name or description',
      category: 'Select Category',
      storage: 'Storage',
      createdDate: 'Created Date',
      action: 'Action',
      name: 'Name',
      letterNumber: 'Letter_Number',
      status: 'Status',
      recipientOrg: 'Recipient_Organization',
      documentCategory: 'Document Category',
      createdBy: 'Created By',
    },
    km: {
      title: 'ឯកសារទាំងអស់',
      tabs: {
        all: 'ឯកសារទាំងអស់',
        incoming: 'ចូល',
        outgoing: 'ចេញ',
        internal: 'ឯកសារផ្ទៃក្នុង',
      },
      addDocument: '+ បន្ថែមឯកសារ',
      searchName: 'ស្វែងរកតាមឈ្មោះ ឬពិពណ៌នា',
      category: 'ជ្រើសប្រភេទ',
      storage: 'ទីតាំងផ្ទុក',
      createdDate: 'កាលបរិច្ឆេទបង្កើត',
      action: 'សកម្មភាព',
      name: 'ឈ្មោះ',
      letterNumber: 'លេខលិខិត',
      status: 'ស្ថានភាព',
      recipientOrg: 'អង្គភាពទទួល',
      documentCategory: 'ប្រភេទឯកសារ',
      createdBy: 'បង្កើតដោយ',
    },
  }[localeValue === 'km' ? 'km' : 'en'];

  const rows = savedArticles
    .map((article) => ({
      name: article.title,
      letterNumber: String(article.typo3ArticleUid),
      status: 'SAVED',
      recipientOrg: '-',
      category: article.language === 'km' ? 'Internal Documents' : 'Compliance Documents',
      storage: article.typo3ArticleUid % 2 === 0 ? 'MINIO' : 'Local Disk',
      createdDate: article.savedAt.toLocaleDateString('en-US'),
      createdBy: session?.user?.name ?? 'User',
      href: `/${localeValue}/article/${article.typo3ArticleUid}`,
    }))
    .filter((row) => (storage === 'all' ? true : row.storage === storage));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-slate-700">{t.title}</h1>
        <button type="button" className="rounded-lg border border-emerald-500 bg-white px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50">
          {t.addDocument}
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="grid grid-cols-2 gap-0 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-600 md:grid-cols-4">
          {Object.entries(t.tabs).map(([key, label]) => {
            const active = key === tab;
            return (
              <Link
                key={key}
                href={`/${localeValue}/dashboard?tab=${key}${q ? `&q=${encodeURIComponent(q)}` : ''}${storage !== 'all' ? `&storage=${encodeURIComponent(storage)}` : ''}`}
                className={`px-4 py-3 text-center ${active ? 'bg-indigo-700 text-white' : 'bg-slate-50 hover:bg-slate-100'}`}
              >
                {label}
              </Link>
            );
          })}
        </div>

        <form method="GET" className="grid grid-cols-1 gap-3 border-b border-slate-200 bg-slate-50 p-3 md:grid-cols-5">
          <input type="hidden" name="tab" value={tab} />
          <input
            name="q"
            defaultValue={q}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
            placeholder={t.searchName}
          />
          <select className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"><option>{t.category}</option></select>
          <select name="storage" defaultValue={storage} className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm">
            <option value="all">{t.storage}</option>
            <option value="MINIO">MINIO</option>
            <option value="Local Disk">Local Disk</option>
          </select>
          <input className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" placeholder={t.createdDate} />
          <button type="submit" className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700">Filter</button>
        </form>

        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full text-sm">
            <thead className="bg-white text-slate-700">
              <tr className="border-b border-slate-200">
                <th className="px-3 py-3 text-left"><input type="checkbox" /></th>
                <th className="px-3 py-3 text-left">{t.action}</th>
                <th className="px-3 py-3 text-left">{t.name}</th>
                <th className="px-3 py-3 text-left">{t.letterNumber}</th>
                <th className="px-3 py-3 text-left">{t.status}</th>
                <th className="px-3 py-3 text-left">{t.recipientOrg}</th>
                <th className="px-3 py-3 text-left">{t.documentCategory}</th>
                <th className="px-3 py-3 text-left">{t.storage}</th>
                <th className="px-3 py-3 text-left">{t.createdDate}</th>
                <th className="px-3 py-3 text-left">{t.createdBy}</th>
              </tr>
            </thead>
            <tbody>
              {rows.length ? rows.map((row) => (
                <tr key={row.name} className="border-b border-slate-100 text-slate-700 hover:bg-slate-50">
                  <td className="px-3 py-2"><input type="checkbox" /></td>
                  <td className="px-3 py-2">⋮</td>
                  <td className="px-3 py-2">
                    <Link href={row.href} className="text-indigo-600 hover:underline">
                      {row.name}
                    </Link>
                  </td>
                  <td className="px-3 py-2">{row.letterNumber}</td>
                  <td className="px-3 py-2">
                    <span className="rounded bg-slate-600 px-2 py-1 text-xs font-semibold text-white">{row.status}</span>
                  </td>
                  <td className="px-3 py-2">{row.recipientOrg}</td>
                  <td className="px-3 py-2">{row.category}</td>
                  <td className="px-3 py-2">{row.storage}</td>
                  <td className="px-3 py-2">{row.createdDate}</td>
                  <td className="px-3 py-2">{row.createdBy}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={10} className="px-3 py-10 text-center text-slate-500">
                    No documents found for the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <span>Items per page:</span>
            <select className="rounded border border-slate-300 px-2 py-1"><option>10</option></select>
          </div>
          <div>1 - {rows.length} of {rows.length}</div>
        </div>
      </div>

      {isDev ? (
        <GuardAuditPanel
          locale={localeValue}
          route={`/${localeValue}/dashboard`}
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
