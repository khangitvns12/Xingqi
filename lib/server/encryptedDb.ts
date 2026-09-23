import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// Master encryption key derived from environment or internal cryptographically secure salt
const ENCRYPTION_SECRET = process.env.DB_ENCRYPTION_KEY || 'tien_ky_cuu_chau_dao_v1_secure_master_salt_2026';
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const KEY_LENGTH = 32;

// Derive a 32-byte key using PBKDF2
function getDerivedKey(): Buffer {
  return crypto.pbkdf2Sync(ENCRYPTION_SECRET, 'tien_ky_salt_xianxia_realm', 100000, KEY_LENGTH, 'sha256');
}

export interface EncryptedPayload {
  format: 'TIEN_KY_ENCRYPTED_DB_V1';
  algorithm: string;
  iv: string; // hex
  authTag: string; // hex
  ciphertext: string; // hex
  checksum: string; // sha256 of plaintext
  timestamp: number;
}

/**
 * Encrypt arbitrary object data to an EncryptedPayload JSON structure.
 */
export function encryptData<T>(data: T): EncryptedPayload {
  const plaintext = JSON.stringify(data);
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = getDerivedKey();

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let ciphertext = cipher.update(plaintext, 'utf-8', 'hex');
  ciphertext += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  const checksum = crypto.createHash('sha256').update(plaintext).digest('hex');

  return {
    format: 'TIEN_KY_ENCRYPTED_DB_V1',
    algorithm: ALGORITHM,
    iv: iv.toString('hex'),
    authTag,
    ciphertext,
    checksum,
    timestamp: Date.now(),
  };
}

/**
 * Decrypt an EncryptedPayload back into its typed object.
 */
export function decryptData<T>(payload: EncryptedPayload): T {
  if (payload.format !== 'TIEN_KY_ENCRYPTED_DB_V1') {
    throw new Error('Định dạng cơ sở dữ liệu mã hóa không tương thích');
  }

  const key = getDerivedKey();
  const iv = Buffer.from(payload.iv, 'hex');
  const authTag = Buffer.from(payload.authTag, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(payload.ciphertext, 'hex', 'utf-8');
  decrypted += decipher.final('utf-8');

  // Verify checksum integrity
  const actualChecksum = crypto.createHash('sha256').update(decrypted).digest('hex');
  if (payload.checksum && actualChecksum !== payload.checksum) {
    throw new Error('Cơ sở dữ liệu mã hóa bị sai lệch kiểm tra tính toàn vẹn (checksum mismatch)');
  }

  return JSON.parse(decrypted) as T;
}

/**
 * Encrypt and write to file atomically.
 */
export function writeEncryptedFile<T>(filePath: string, data: T): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const payload = encryptData(data);
  const tempPath = `${filePath}.${Date.now()}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(payload, null, 2), 'utf-8');
  fs.renameSync(tempPath, filePath);
}

/**
 * Read and decrypt from file. Returns null if file not found or decryption fails.
 */
export function readEncryptedFile<T>(filePath: string): T | null {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(content);

    // If it is our encrypted format:
    if (parsed && parsed.format === 'TIEN_KY_ENCRYPTED_DB_V1') {
      return decryptData<T>(parsed);
    }

    // Backward compatibility: If plain JSON was stored, migrate it!
    return parsed as T;
  } catch (err) {
    console.error(`[EncryptedDB] Error reading or decrypting file ${filePath}:`, err);
    return null;
  }
}
