export function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function parsePositiveInt(input: string | null | undefined, fallback: number) {
  const parsed = Number(input ?? String(fallback));
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.floor(parsed);
}

export function parseLocale(input?: string | null): 'en' | 'km' {
  return input === 'km' ? 'km' : 'en';
}
