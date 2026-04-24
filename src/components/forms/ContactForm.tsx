'use client';

import { useState } from 'react';
import { Locale } from '@/lib/i18n';

interface ContactFormProps {
  locale: Locale;
}

export default function ContactForm({ locale }: ContactFormProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const t = {
    en: {
      title: 'Contact Us',
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      subject: 'Subject',
      message: 'Message',
      submit: 'Send Message',
      success: 'Message sent successfully',
      error: 'Failed to send message',
    },
    km: {
      title: 'ទំនាក់ទំនងមកកាន់យើង',
      name: 'ឈ្មោះ',
      email: 'អ៊ីមែល',
      phone: 'ទូរស័ព្ទ',
      subject: 'ប្រធានបទ',
      message: 'សារ',
      submit: 'ផ្ញើសារ',
      success: 'បានផ្ញើសារដោយជោគជ័យ',
      error: 'ផ្ញើសារមិនបានជោគជ័យ',
    },
  }[locale === 'km' ? 'km' : 'en'];

  function updateField(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch('/api/forms/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed');
      setStatus(t.success);
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch {
      setStatus(t.error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-2xl">
      <h1 className="text-3xl font-bold">{t.title}</h1>
      <input className="w-full border rounded-lg px-4 py-2" placeholder={t.name} value={form.name} onChange={(e) => updateField('name', e.target.value)} />
      <input className="w-full border rounded-lg px-4 py-2" placeholder={t.email} type="email" required value={form.email} onChange={(e) => updateField('email', e.target.value)} />
      <input className="w-full border rounded-lg px-4 py-2" placeholder={t.phone} value={form.phone} onChange={(e) => updateField('phone', e.target.value)} />
      <input className="w-full border rounded-lg px-4 py-2" placeholder={t.subject} value={form.subject} onChange={(e) => updateField('subject', e.target.value)} />
      <textarea className="w-full border rounded-lg px-4 py-2 min-h-40" placeholder={t.message} required value={form.message} onChange={(e) => updateField('message', e.target.value)} />
      <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
        {loading ? '...' : t.submit}
      </button>
      {status ? <p className="text-sm text-gray-600">{status}</p> : null}
    </form>
  );
}
