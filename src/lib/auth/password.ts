/**
 * Password Hashing for Cloudflare Workers
 *
 * Uses Web Crypto API which is available in Cloudflare Workers
 * Implements PBKDF2 with SHA-256 for password hashing
 */

// Configuration
const ITERATIONS = 100000; // Number of iterations for PBKDF2
const KEY_LENGTH = 32; // 256 bits
const SALT_LENGTH = 16; // 128 bits

/**
 * Generate a random salt
 */
function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
}

/**
 * Convert ArrayBuffer to hex string
 */
function arrayBufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Convert hex string to Uint8Array
 */
function hexToUint8Array(hex: string): Uint8Array {
  const matches = hex.match(/.{1,2}/g);
  if (!matches) return new Uint8Array(0);
  return new Uint8Array(matches.map((byte) => parseInt(byte, 16)));
}

/**
 * Derive key from password using PBKDF2
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey('raw', passwordBuffer, 'PBKDF2', false, [
    'deriveBits',
  ]);

  // Derive bits using PBKDF2
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    KEY_LENGTH * 8, // in bits
  );

  return derivedBits;
}

/**
 * Hash a password
 * Returns format: iterations$salt$hash (all hex encoded)
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = generateSalt();
  const derivedKey = await deriveKey(password, salt);

  const saltHex = arrayBufferToHex(salt.buffer);
  const hashHex = arrayBufferToHex(derivedKey);

  return `${ITERATIONS}$${saltHex}$${hashHex}`;
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  try {
    const parts = storedHash.split('$');

    // Handle legacy bcrypt-style hashes (demo data)
    if (storedHash.startsWith('$2a$') || storedHash.startsWith('$2b$')) {
      console.warn(
        'Legacy bcrypt hash detected - password verification not supported. Please reset password.',
      );
      return false;
    }

    if (parts.length !== 3) {
      return false;
    }

    const [iterationsStr, saltHex, hashHex] = parts;
    const iterations = parseInt(iterationsStr, 10);

    if (iterations !== ITERATIONS) {
      // Version mismatch - could handle migration here
      console.warn('Hash iterations mismatch');
    }

    const salt = hexToUint8Array(saltHex);
    const derivedKey = await deriveKey(password, salt);
    const derivedHex = arrayBufferToHex(derivedKey);

    // Constant-time comparison to prevent timing attacks
    return constantTimeEqual(derivedHex, hashHex);
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Check if a password meets minimum requirements
 */
export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('La contrasena debe tener al menos 8 caracteres');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('La contrasena debe tener al menos una mayuscula');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('La contrasena debe tener al menos una minuscula');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('La contrasena debe tener al menos un numero');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Check if a password hash needs to be rehashed (version upgrade)
 */
export function needsRehash(hash: string): boolean {
  // Legacy bcrypt hashes need migration
  if (hash.startsWith('$2a$') || hash.startsWith('$2b$')) {
    return true;
  }

  // Check if using current iteration count
  const parts = hash.split('$');
  if (parts.length !== 3) {
    return true;
  }

  const iterations = parseInt(parts[0], 10);
  return iterations !== ITERATIONS;
}
