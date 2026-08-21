import crypto from 'crypto';

/**
 * Generate a secure random token for password reset and email verification
 * Uses cryptographically secure random bytes
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Hash a token for storage in database
 * This prevents tokens from being leaked if database is compromised
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Verify a token by comparing hashes
 * @param providedToken - The token provided by user
 * @param hashedToken - The hashed token stored in database
 */
export function verifyTokenHash(providedToken: string, hashedToken: string): boolean {
  const hash = hashToken(providedToken);
  return crypto.timingSafeEqual(
    Buffer.from(hash),
    Buffer.from(hashedToken),
  );
}

/**
 * Generate a time-based expiry date
 * @param expiryHours - Number of hours until expiry (default: 24)
 */
export function generateExpiryDate(expiryHours: number = 24): Date {
  return new Date(Date.now() + expiryHours * 60 * 60 * 1000);
}

/**
 * Check if a token has expired
 */
export function isTokenExpired(expiryDate: Date): boolean {
  return new Date() > expiryDate;
}

/**
 * Generate both token and its hash (useful for creation)
 */
export function generateTokenPair(length: number = 32) {
  const token = generateSecureToken(length);
  const hashedToken = hashToken(token);
  const expiryDate = generateExpiryDate();

  return {
    token, // Send to user
    hashedToken, // Store in database
    expiryDate,
  };
}

/**
 * Sanitize error messages to prevent timing attacks
 * Always return the same message regardless of token validity
 */
export function getTokenErrorMessage(): string {
  return 'Invalid or expired token. Please try again.';
}

export default {
  generateSecureToken,
  hashToken,
  verifyTokenHash,
  generateExpiryDate,
  isTokenExpired,
  generateTokenPair,
  getTokenErrorMessage,
};
