'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Locale } from '@/lib/i18n';

export default function SignUpPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const routeParams = useParams<{ locale: string }>();

  const locale = ((routeParams?.locale as string) || 'en') as Locale;

  const translations = {
    en: {
      signUp: 'Sign Up',
      fullName: 'Full Name',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      signUpBtn: 'Sign Up',
      haveAccount: 'Already have an account?',
      signIn: 'Sign In',
      passwordMismatch: 'Passwords do not match',
      userExists: 'User with this email already exists',
      signUpError: 'Sign up failed. Please try again.',
      signingUp: 'Signing up...',
    },
    km: {
      signUp: 'ចុះឈ្មោះ',
      fullName: 'ឈ្មោះពេញលេញ',
      email: 'អ៊ីមែល',
      password: 'ពាក្យលេខសម្ងាត់',
      confirmPassword: 'បញ្ជាក់ពាក្យលេខសម្ងាត់',
      signUpBtn: 'ចុះឈ្មោះ',
      haveAccount: 'មានគណនីរួចហើយឬ?',
      signIn: 'ចូលប្រើប្រាស់',
      passwordMismatch: 'ពាក្យលេខសម្ងាត់មិនត្រូវគ្នា',
      userExists: 'ប្រើប្រាស់ដែលមានអ៊ីមែលនេះមាន',
      signUpError: 'ការចុះឈ្មោះបានបរាជ័យ។ សូមព្យាយាមម្តងទៀត។',
      signingUp: 'កំពុងចុះឈ្មោះ...',
    },
  };

  const t = translations[locale] || translations.en;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (password !== confirmPassword) {
      setError(t.passwordMismatch);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName,
          email,
          password,
        }),
      });

      if (response.status === 409) {
        setError(t.userExists);
      } else if (!response.ok) {
        setError(t.signUpError);
      } else {
        router.push(`/${locale}/auth/signin`);
      }
    } catch {
      setError(t.signUpError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            {t.signUp}
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="fullName" className="sr-only">
                {t.fullName}
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-600 focus:border-blue-600 focus:z-10 sm:text-sm"
                placeholder={t.fullName}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="email" className="sr-only">
                {t.email}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-600 focus:border-blue-600 focus:z-10 sm:text-sm"
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
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-600 focus:border-blue-600 focus:z-10 sm:text-sm"
                placeholder={t.password}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                {t.confirmPassword}
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-600 focus:border-blue-600 focus:z-10 sm:text-sm"
                placeholder={t.confirmPassword}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
              {isLoading ? t.signingUp : t.signUpBtn}
            </button>
          </div>

          <div className="text-center text-sm">
            <span className="text-gray-600">{t.haveAccount} </span>
            <Link
              href={`/${locale}/auth/signin`}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              {t.signIn}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
