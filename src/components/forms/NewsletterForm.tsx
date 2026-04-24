'use client';

import { useState } from 'react';
import { Locale } from '@/lib/i18n';

interface NewsletterFormProps {
  locale: Locale;
}

export default function NewsletterForm({ locale }: NewsletterFormProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const t = {
    en: {
      placeholder: 'Your email',
      submit: 'Subscribe',
      success: 'Subscription successful',
      error: 'Subscription failed',
    },
    km: {
      placeholder: 'អ៊ីមែលរបស់អ្នក',
      submit: 'ចូលរួម',
      success: 'បានចុះឈ្មោះដោយជោគជ័យ',
      error: 'ចុះឈ្មោះមិនបានជោគជ័យ',
    },
  }[locale === 'km' ? 'km' : 'en'];

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/forms/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, locale }),
      });

      if (!res.ok) {
        throw new Error('Failed');
      }

      setEmail('');
      setMessage(t.success);
    } catch {
      setMessage(t.error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="flex gap-2 max-w-md mx-auto">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t.placeholder}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? '...' : t.submit}
        </button>
      </div>
      {message ? <p className="text-sm text-gray-600">{message}</p> : null}
    </form>
  );
}
