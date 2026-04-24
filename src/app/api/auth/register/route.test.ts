import { NextRequest } from 'next/server';
import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('@/lib/db', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('hashed_password'),
  },
}));

import prisma from '@/lib/db';
import { POST } from './route';

const makeRequest = (body: unknown) =>
  new NextRequest('http://localhost/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 400 when email is missing', async () => {
    const res = await POST(makeRequest({ password: 'password123' }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Invalid input');
  });

  it('returns 400 when password is shorter than 6 characters', async () => {
    const res = await POST(makeRequest({ email: 'new@npch.local', password: 'abc' }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Invalid input');
  });

  it('returns 409 when user already exists', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'existing-id',
      email: 'new@npch.local',
    } as never);

    const res = await POST(makeRequest({ email: 'new@npch.local', password: 'password123' }));
    expect(res.status).toBe(409);
    const json = await res.json();
    expect(json.error).toBe('User already exists');
  });

  it('returns 201 with user data on successful registration', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.user.create).mockResolvedValue({
      id: 'new-user-id',
      email: 'new@npch.local',
      name: 'New User',
    } as never);

    const res = await POST(
      makeRequest({ email: 'new@npch.local', password: 'password123', fullName: 'New User' })
    );
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.user.email).toBe('new@npch.local');
    expect(json.user.name).toBe('New User');
    expect(json.user.id).toBe('new-user-id');

    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: 'new@npch.local',
          name: 'New User',
          password: 'hashed_password',
          language: 'en',
        }),
      })
    );
  });

  it('returns 500 on unexpected database error', async () => {
    vi.mocked(prisma.user.findUnique).mockRejectedValue(new Error('DB connection lost'));

    const res = await POST(makeRequest({ email: 'new@npch.local', password: 'password123' }));
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toBe('Internal server error');
  });
});
