import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword, validatePassword, needsRehash } from './password';

describe('hashPassword', () => {
  it('returns a PBKDF2 format string (iterations$salt$hash)', async () => {
    const hash = await hashPassword('TestPassword1');
    const parts = hash.split('$');
    expect(parts.length).toBe(3);
    expect(parseInt(parts[0], 10)).toBe(100000);
    // Salt should be 32 hex chars (16 bytes)
    expect(parts[1].length).toBe(32);
    // Hash should be 64 hex chars (32 bytes)
    expect(parts[2].length).toBe(64);
  });

  it('generates different hashes for the same password (unique salts)', async () => {
    const hash1 = await hashPassword('TestPassword1');
    const hash2 = await hashPassword('TestPassword1');
    expect(hash1).not.toBe(hash2);
  });
});

describe('verifyPassword', () => {
  it('correctly verifies a password against its hash', async () => {
    const password = 'MySecurePass1';
    const hash = await hashPassword(password);
    const result = await verifyPassword(password, hash);
    expect(result).toBe(true);
  });

  it('returns false for wrong password', async () => {
    const hash = await hashPassword('CorrectPassword1');
    const result = await verifyPassword('WrongPassword1', hash);
    expect(result).toBe(false);
  });

  it('returns false for legacy bcrypt hashes', async () => {
    const bcryptHash = '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012';
    const result = await verifyPassword('anypassword', bcryptHash);
    expect(result).toBe(false);
  });

  it('returns false for $2b$ bcrypt hashes', async () => {
    const bcryptHash = '$2b$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012';
    const result = await verifyPassword('anypassword', bcryptHash);
    expect(result).toBe(false);
  });

  it('returns false for malformed hash (wrong number of parts)', async () => {
    const result = await verifyPassword('password', 'invalid-hash');
    expect(result).toBe(false);
  });

  it('returns false for empty stored hash', async () => {
    const result = await verifyPassword('password', '');
    expect(result).toBe(false);
  });
});

describe('validatePassword', () => {
  it('accepts a valid password', () => {
    const result = validatePassword('GoodPass1');
    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it('rejects password shorter than 8 characters', () => {
    const result = validatePassword('Ab1');
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('rejects password without uppercase letter', () => {
    const result = validatePassword('lowercase1');
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(expect.stringContaining('mayuscula'));
  });

  it('rejects password without lowercase letter', () => {
    const result = validatePassword('UPPERCASE1');
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(expect.stringContaining('minuscula'));
  });

  it('rejects password without number', () => {
    const result = validatePassword('NoNumberHere');
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(expect.stringContaining('numero'));
  });
});

describe('needsRehash', () => {
  it('returns true for legacy bcrypt $2a$ hashes', () => {
    expect(needsRehash('$2a$10$abcdefghijklmnopqrstuuABCDEF')).toBe(true);
  });

  it('returns true for legacy bcrypt $2b$ hashes', () => {
    expect(needsRehash('$2b$10$abcdefghijklmnopqrstuuABCDEF')).toBe(true);
  });

  it('returns true for malformed hash', () => {
    expect(needsRehash('not-a-valid-hash')).toBe(true);
  });

  it('returns false for current format with correct iterations', async () => {
    const hash = await hashPassword('TestPassword1');
    expect(needsRehash(hash)).toBe(false);
  });

  it('returns true if iterations differ from current', () => {
    expect(needsRehash('50000$aabbccdd$eeff0011')).toBe(true);
  });
});
