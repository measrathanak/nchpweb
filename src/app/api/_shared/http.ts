import { NextResponse } from 'next/server';

export function ok(data: unknown, status: number = 200) {
  return NextResponse.json(data, { status });
}

export function created(data: unknown) {
  return NextResponse.json(data, { status: 201 });
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function unauthorized(message: string = 'Unauthorized') {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function serverError(message: string) {
  return NextResponse.json({ error: message }, { status: 500 });
}
