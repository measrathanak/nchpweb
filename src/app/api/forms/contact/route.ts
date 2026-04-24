import { NextRequest } from 'next/server';
import { submitForm } from '@/lib/db/utils';
import { badRequest, created, serverError } from '@/app/api/_shared/http';
import { isEmail } from '@/app/api/_shared/validation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body as {
      name?: string;
      email?: string;
      phone?: string;
      subject?: string;
      message?: string;
    };

    if (!email || !isEmail(email) || !message?.trim()) {
      return badRequest('Invalid input');
    }

    const formSubmission = await submitForm({
      formType: 'contact',
      email,
      name,
      phone,
      formData: {
        subject: subject ?? '',
        message,
      },
    });

    return created({ id: formSubmission.id, status: formSubmission.status });
  } catch (error) {
    console.error('Contact form API error:', error);
    return serverError('Failed to submit form');
  }
}
