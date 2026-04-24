import { NextRequest } from 'next/server';
import { submitForm } from '@/lib/db/utils';
import { badRequest, created, serverError } from '@/app/api/_shared/http';
import { isEmail } from '@/app/api/_shared/validation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, locale } = body as { email?: string; locale?: string };

    if (!email || !isEmail(email)) {
      return badRequest('Invalid email');
    }

    const formSubmission = await submitForm({
      formType: 'newsletter',
      email,
      formData: {
        locale: locale ?? 'en',
        source: 'homepage',
      },
    });

    return created({ id: formSubmission.id, status: formSubmission.status });
  } catch (error) {
    console.error('Newsletter API error:', error);
    return serverError('Failed to subscribe');
  }
}
