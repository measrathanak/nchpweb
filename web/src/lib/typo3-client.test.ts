import { afterEach, describe, expect, it } from 'vitest';
import { getTypo3RevalidateSeconds } from './typo3-client';

const originalRevalidate = process.env.TYPO3_API_REVALIDATE_SECONDS;

afterEach(() => {
  if (originalRevalidate === undefined) {
    delete process.env.TYPO3_API_REVALIDATE_SECONDS;
    return;
  }

  process.env.TYPO3_API_REVALIDATE_SECONDS = originalRevalidate;
});

describe('getTypo3RevalidateSeconds', () => {
  it('defaults to 300 seconds when env is missing', () => {
    delete process.env.TYPO3_API_REVALIDATE_SECONDS;

    expect(getTypo3RevalidateSeconds()).toBe(300);
  });

  it('falls back to 300 seconds when env is invalid', () => {
    process.env.TYPO3_API_REVALIDATE_SECONDS = 'invalid';

    expect(getTypo3RevalidateSeconds()).toBe(300);
  });

  it('uses a normalized positive integer value from env', () => {
    process.env.TYPO3_API_REVALIDATE_SECONDS = '120.9';

    expect(getTypo3RevalidateSeconds()).toBe(120);
  });
});