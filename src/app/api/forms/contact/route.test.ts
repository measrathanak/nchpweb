import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const submitFormMock = vi.fn();

vi.mock('@/lib/db/utils', () => ({
  submitForm: submitFormMock,
}));

describe('POST /api/forms/contact', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects invalid input before writing to the database', async () => {
    const { POST } = await import('./route');
    const request = new NextRequest('http://localhost:3000/api/forms/contact', {
      method: 'POST',
      body: JSON.stringify({ email: 'bad-email', message: '' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ error: 'Invalid input' });
    expect(submitFormMock).not.toHaveBeenCalled();
  });

  it('stores a valid contact form submission', async () => {
    submitFormMock.mockResolvedValue({
      id: 'submission-1',
      status: 'pending',
    });

    const { POST } = await import('./route');
    const request = new NextRequest('http://localhost:3000/api/forms/contact', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        phone: '012345678',
        subject: 'Hello',
        message: 'This is a valid message.',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(submitFormMock).toHaveBeenCalledWith({
      formType: 'contact',
      email: 'test@example.com',
      name: 'Test User',
      phone: '012345678',
      formData: {
        subject: 'Hello',
        message: 'This is a valid message.',
      },
    });
    expect(body).toEqual({ id: 'submission-1', status: 'pending' });
  });

  it('returns a server error when the database write fails', async () => {
    submitFormMock.mockRejectedValue(new Error('db failure'));

    const { POST } = await import('./route');
    const request = new NextRequest('http://localhost:3000/api/forms/contact', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        message: 'Still valid.',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ error: 'Failed to submit form' });
  });
});