const encryptionService = require('../../services/encryptionService');

describe('Encryption Service', () => {
  describe('Basic Encryption/Decryption', () => {
    test('should encrypt and decrypt data', () => {
      const plaintext = 'sensitive patient data';
      const encrypted = encryptionService.encrypt(plaintext);

      expect(encrypted).toBeDefined();
      expect(encrypted).not.toBe(plaintext);
      expect(encrypted).toContain(':'); // IV:AuthTag:EncryptedData format

      const decrypted = encryptionService.decrypt(encrypted);
      expect(decrypted).toBe(plaintext);
    });

    test('should handle object encryption', () => {
      const obj = {
        firstName: 'John',
        email: 'john@example.com',
        medicalData: 'sensitive info'
      };

      const encrypted = encryptionService.encrypt(obj);
      const decrypted = encryptionService.decrypt(encrypted);

      expect(decrypted).toEqual(obj);
    });

    test('should handle null/undefined', () => {
      expect(encryptionService.encrypt(null)).toBeNull();
      expect(encryptionService.encrypt(undefined)).toBeNull();
      expect(encryptionService.decrypt(null)).toBeNull();
      expect(encryptionService.decrypt(undefined)).toBeNull();
    });

    test('should generate different ciphertexts for same plaintext', () => {
      const plaintext = 'test data';
      const encrypted1 = encryptionService.encrypt(plaintext);
      const encrypted2 = encryptionService.encrypt(plaintext);

      expect(encrypted1).not.toBe(encrypted2);

      const decrypted1 = encryptionService.decrypt(encrypted1);
      const decrypted2 = encryptionService.decrypt(encrypted2);

      expect(decrypted1).toBe(plaintext);
      expect(decrypted2).toBe(plaintext);
    });

    test('should fail on corrupted data', () => {
      const plaintext = 'test data';
      const encrypted = encryptionService.encrypt(plaintext);
      const corrupted = encrypted.substring(0, encrypted.length - 10) + 'corrupted';

      expect(() => {
        encryptionService.decrypt(corrupted);
      }).toThrow();
    });
  });

  describe('Hashing', () => {
    test('should hash data', () => {
      const data = 'password123';
      const hash = encryptionService.hash(data);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(data);
      expect(hash.length).toBe(64); // SHA256 hex length
    });

    test('should consistently hash same data', () => {
      const data = 'password123';
      const hash1 = encryptionService.hash(data);
      const hash2 = encryptionService.hash(data);

      expect(hash1).toBe(hash2);
    });

    test('should create different hashes for different data', () => {
      const hash1 = encryptionService.hash('password1');
      const hash2 = encryptionService.hash('password2');

      expect(hash1).not.toBe(hash2);
    });

    test('should compare hashes correctly', () => {
      const data = 'password123';
      const hash = encryptionService.hash(data);

      expect(encryptionService.compare(data, hash)).toBe(true);
      expect(encryptionService.compare('wrongpassword', hash)).toBe(false);
    });
  });

  describe('Field Encryption', () => {
    test('should encrypt specific fields in object', () => {
      const obj = {
        firstName: 'John',
        email: 'john@example.com',
        medicalHistory: 'sensitive'
      };

      const encrypted = encryptionService.encryptFields(obj, ['email', 'medicalHistory']);

      expect(encrypted.firstName).toBe('John');
      expect(encrypted.email).not.toBe('john@example.com');
      expect(encrypted.medicalHistory).not.toBe('sensitive');
      expect(encrypted.email_encrypted).toBe(true);
      expect(encrypted.medicalHistory_encrypted).toBe(true);
    });

    test('should decrypt encrypted fields', () => {
      const obj = {
        firstName: 'John',
        email: 'john@example.com',
        medicalHistory: 'sensitive'
      };

      const encrypted = encryptionService.encryptFields(obj, ['email', 'medicalHistory']);
      const decrypted = encryptionService.decryptFields(encrypted, ['email', 'medicalHistory']);

      expect(decrypted.firstName).toBe('John');
      expect(decrypted.email).toBe('john@example.com');
      expect(decrypted.medicalHistory).toBe('sensitive');
      expect(decrypted.email_encrypted).toBeUndefined();
    });

    test('should skip non-existent fields', () => {
      const obj = {
        firstName: 'John'
      };

      const encrypted = encryptionService.encryptFields(obj, ['email', 'phone']);
      expect(encrypted.firstName).toBe('John');
      expect(encrypted.email_encrypted).toBeUndefined();
    });
  });

  describe('Token Generation', () => {
    test('should generate random tokens', () => {
      const token1 = encryptionService.generateToken();
      const token2 = encryptionService.generateToken();

      expect(token1).toBeDefined();
      expect(token2).toBeDefined();
      expect(token1).not.toBe(token2);
      expect(token1.length).toBe(64); // 32 bytes = 64 hex chars
    });

    test('should support custom token length', () => {
      const token = encryptionService.generateToken(16);
      expect(token.length).toBe(32); // 16 bytes = 32 hex chars
    });

    test('should generate reset tokens with expiry', () => {
      const { token, hash, expiresAt } = encryptionService.generateResetToken();

      expect(token).toBeDefined();
      expect(hash).toBeDefined();
      expect(expiresAt).toBeInstanceOf(Date);
      expect(expiresAt.getTime()).toBeGreaterThan(Date.now());

      // Should expire in ~1 hour
      const expiryTime = expiresAt.getTime() - Date.now();
      expect(expiryTime).toBeGreaterThan(3599000); // Just under 1 hour
      expect(expiryTime).toBeLessThan(3600001); // Just over 1 hour
    });

    test('should hash reset tokens', () => {
      const { token, hash } = encryptionService.generateResetToken();

      const tokenHash = encryptionService.hash(token);
      expect(tokenHash).toBe(hash);
    });
  });

  describe('Security Properties', () => {
    test('should use AES-256-GCM algorithm', () => {
      expect(encryptionService.algorithm).toBe('aes-256-gcm');
    });

    test('should use proper IV length', () => {
      expect(encryptionService.ivLength).toBe(12);
    });

    test('should use PBKDF2 key derivation', () => {
      const plaintext = 'test';
      const encrypted = encryptionService.encrypt(plaintext);

      // Key should be derived from master key
      expect(encryptionService.encryptionKey).toBeDefined();
      expect(encryptionService.encryptionKey.length).toBe(32); // 256 bits
    });

    test('should produce valid authentication tags', () => {
      const plaintext = 'test data';
      const encrypted = encryptionService.encrypt(plaintext);
      const parts = encrypted.split(':');

      expect(parts.length).toBe(3); // IV:AuthTag:EncryptedData
      expect(parts[1].length).toBe(32); // 16 bytes = 32 hex chars
    });
  });

  describe('Data Integrity', () => {
    test('should detect tampering with encrypted data', () => {
      const plaintext = 'important data';
      const encrypted = encryptionService.encrypt(plaintext);
      const parts = encrypted.split(':');

      // Tamper with encrypted data
      parts[2] = parts[2].substring(0, parts[2].length - 2) + 'XX';
      const tampered = parts.join(':');

      expect(() => {
        encryptionService.decrypt(tampered);
      }).toThrow();
    });

    test('should detect tampering with auth tag', () => {
      const plaintext = 'important data';
      const encrypted = encryptionService.encrypt(plaintext);
      const parts = encrypted.split(':');

      // Tamper with auth tag
      parts[1] = parts[1].substring(0, parts[1].length - 2) + 'XX';
      const tampered = parts.join(':');

      expect(() => {
        encryptionService.decrypt(tampered);
      }).toThrow();
    });

    test('should handle invalid format', () => {
      expect(() => {
        encryptionService.decrypt('invalid-format');
      }).toThrow();
    });
  });
});
