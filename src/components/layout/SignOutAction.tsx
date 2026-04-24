'use server';

import { signOut } from '@/auth';

export async function handleSignOut(locale: string) {
  await signOut({ redirectTo: `/${locale}` });
}
