'use client';

import { useState, useEffect, useCallback } from 'react';

export interface LoginAuditRow {
  id: string;
  email: string;
  status: string;
  reason: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  latitude: number | null;
  longitude: number | null;
  timestamp: string;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export default function LoginAuditLogs() {
  const [audits, setAudits] = useState<LoginAuditRow[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({ total: 0, page: 1, limit: 10, pages: 0 });
  const [searchEmail, setSearchEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const loadAudits = useCallback(
    async (page: number) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '10',
          ...(searchEmail && { email: searchEmail }),
        });
        const res = await fetch(`/api/login-audits?${params}`);
        if (!res.ok) throw new Error('Failed to load');
        const data = (await res.json()) as { data: LoginAuditRow[]; pagination: PaginationInfo };
        setAudits(data.data);
        setPagination(data.pagination);
      } catch {
        setAudits([]);
      } finally {
        setLoading(false);
      }
    },
    [searchEmail]
  );

  useEffect(() => {
    loadAudits(1);
  }, [searchEmail, loadAudits]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadAudits(1);
  };

  const formatDate = (ts: string) => {
    const date = new Date(ts);
    return date.toLocaleString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="space-y-5">
      {/* Search */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <label className="mb-3 block text-sm font-semibold text-slate-700">Search By Email</label>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="email"
            placeholder="Enter email address…"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm placeholder-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:bg-slate-300"
          >
            Search
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
        <table className="w-full border-collapse">
          <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-600">
            <tr>
              <th className="px-4 py-3 text-left">Date & Time</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">IP Address</th>
              <th className="px-4 py-3 text-left">Latitude</th>
              <th className="px-4 py-3 text-left">Longitude</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-sm text-slate-500">
                  Loading…
                </td>
              </tr>
            ) : audits.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-sm text-slate-500">
                  No login audits found
                </td>
              </tr>
            ) : (
              audits.map((audit) => (
                <tr key={audit.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">{formatDate(audit.timestamp)}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{audit.email}</td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold
                        ${
                          audit.status === 'success'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                    >
                      {audit.status === 'success' ? 'Success' : 'Failed'}
                      {audit.reason && ` (${audit.reason})`}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{audit.ipAddress || '—'}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{audit.latitude ? audit.latitude.toFixed(4) : '—'}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{audit.longitude ? audit.longitude.toFixed(4) : '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.pages > 0 && (
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <div className="text-sm text-slate-600">
            Items per page:{' '}
            <span className="rounded-lg border border-slate-300 px-2.5 py-0.5 font-medium">
              {pagination.limit}
            </span>
          </div>
          <div className="text-sm text-slate-600">
            {pagination.page} – {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => loadAudits(pagination.page - 1)}
              disabled={pagination.page === 1 || loading}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              ← Prev
            </button>
            <button
              onClick={() => loadAudits(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages || loading}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
