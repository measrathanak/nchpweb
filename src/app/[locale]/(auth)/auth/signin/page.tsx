'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Locale } from '@/lib/i18n';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const routeParams = useParams<{ locale: string }>();

  const locale = ((routeParams?.locale as string) || 'en') as Locale;

  const translations = {
    en: {
      signIn: 'Sign In',
      email: 'Email',
      password: 'Password',
      signInBtn: 'Sign In',
      noAccount: "Don't have an account?",
      signUp: 'Sign Up',
      forgotPassword: 'Forgot Password?',
      invalidCredentials: 'Invalid email or password',
      signInError: 'Sign in failed. Please try again.',
      signingIn: 'Signing in...',
    },
    km: {
      signIn: 'ចូលប្រើប្រាស់',
      email: 'អ៊ីមែល',
      password: 'ពាក្យលេខសម្ងាត់',
      signInBtn: 'ចូលប្រើប្រាស់',
      noAccount: 'មិនមានគណនីទេ?',
      signUp: 'ចុះឈ្មោះ',
      forgotPassword: 'ភ្លេចពាក្យលេខសម្ងាត់?',
      invalidCredentials: 'អ៊ីមែល ឬ ពាក្យលេខសម្ងាត់មិនត្រឹមត្រូវ',
      signInError: 'ការចូលប្រើប្រាស់បានបរាជ័យ។ សូមព្យាយាមម្តងទៀត។',
      signingIn: 'កំពុងចូល...',
    },
  };

  const t = translations[locale] || translations.en;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(t.invalidCredentials);
      } else if (result?.ok) {
        router.push(`/${locale}`);
      }
    } catch {
      setError(t.signInError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            {t.signIn}
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                {t.email}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-600 focus:border-blue-600 focus:z-10 sm:text-sm"
                placeholder={t.email}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                {t.password}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-600 focus:border-blue-600 focus:z-10 sm:text-sm"
                placeholder={t.password}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 disabled:opacity-50"
            >
              {isLoading ? t.signingIn : t.signInBtn}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <span className="text-gray-600">{t.noAccount} </span>
              <Link
                href={`/${locale}/auth/signup`}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                {t.signUp}
              </Link>
            </div>
            <div className="text-sm">
              <Link
                href={`/${locale}/auth/reset-password`}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                {t.forgotPassword}
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
