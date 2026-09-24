const crypto = require('crypto');
const logger = require('../utils/logger');

/**
 * Encryption Service for HIPAA-compliant data protection
 * Encrypts sensitive health information at rest
 */

class EncryptionService {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    this.encryptionKey = this.deriveKey(process.env.ENCRYPTION_KEY || 'default-key-change-in-production');
    this.saltLength = 64;
    this.tagLength = 16;
    this.ivLength = 12;
  }

  // Derive encryption key from master key
  deriveKey(masterKey) {
    return crypto
      .pbkdf2Sync(masterKey, 'saans-salt', 100000, 32, 'sha256');
  }

  // Encrypt sensitive data
  encrypt(plaintext) {
    try {
      if (!plaintext) return null;

      // Generate random IV
      const iv = crypto.randomBytes(this.ivLength);

      // Create cipher
      const cipher = crypto.createCipheriv(this.algorithm, this.encryptionKey, iv);

      // Encrypt
      let encrypted = cipher.update(JSON.stringify(plaintext), 'utf8', 'hex');
      encrypted += cipher.final('hex');

      // Get auth tag
      const authTag = cipher.getAuthTag();

      // Combine IV + authTag + encrypted
      const combined = iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;

      logger.debug('Data encrypted', { dataSize: plaintext.toString().length });
      return combined;
    } catch (error) {
      logger.error('Encryption failed', { error: error.message });
      throw error;
    }
  }

  // Decrypt sensitive data
  decrypt(encrypted) {
    try {
      if (!encrypted) return null;

      // Split combined data
      const parts = encrypted.split(':');
      if (parts.length !== 3) {
        throw new Error('Invalid encrypted data format');
      }

      const iv = Buffer.from(parts[0], 'hex');
      const authTag = Buffer.from(parts[1], 'hex');
      const encryptedData = parts[2];

      // Create decipher
      const decipher = crypto.createDecipheriv(this.algorithm, this.encryptionKey, iv);
      decipher.setAuthTag(authTag);

      // Decrypt
      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      logger.debug('Data decrypted');
      return JSON.parse(decrypted);
    } catch (error) {
      logger.error('Decryption failed', { error: error.message });
      throw error;
    }
  }

  // Hash sensitive data (one-way)
  hash(data) {
    try {
      return crypto
        .createHash('sha256')
        .update(data + 'saans-pepper')
        .digest('hex');
    } catch (error) {
      logger.error('Hashing failed', { error: error.message });
      throw error;
    }
  }

  // Compare hashed data
  compare(plaintext, hash) {
    try {
      const hashedPlaintext = this.hash(plaintext);
      return hashedPlaintext === hash;
    } catch (error) {
      logger.error('Hash comparison failed', { error: error.message });
      return false;
    }
  }

  // Encrypt fields in object
  encryptFields(obj, fieldsToEncrypt) {
    try {
      const encrypted = { ...obj };

      fieldsToEncrypt.forEach(field => {
        if (encrypted[field]) {
          encrypted[field] = this.encrypt(encrypted[field]);
          encrypted[`${field}_encrypted`] = true;
        }
      });

      return encrypted;
    } catch (error) {
      logger.error('Field encryption failed', { error: error.message });
      throw error;
    }
  }

  // Decrypt fields in object
  decryptFields(obj, fieldsToDecrypt) {
    try {
      const decrypted = { ...obj };

      fieldsToDecrypt.forEach(field => {
        if (decrypted[field] && decrypted[`${field}_encrypted`]) {
          decrypted[field] = this.decrypt(decrypted[field]);
          delete decrypted[`${field}_encrypted`];
        }
      });

      return decrypted;
    } catch (error) {
      logger.error('Field decryption failed', { error: error.message });
      throw error;
    }
  }

  // Generate secure random token
  generateToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  // Generate password reset token
  generateResetToken() {
    const token = this.generateToken();
    const hash = this.hash(token);
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    return {
      token,
      hash,
      expiresAt
    };
  }
}

module.exports = new EncryptionService();
