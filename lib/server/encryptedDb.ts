import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const ENCRYPTION_KEY = crypto
  .createHash('sha256')
  .update(process.env.ENCRYPTION_SECRET || 'tien-ky-dao-secret-realm-key-v2')
  .digest();

export interface EncryptedPayload {
  iv: string;
  data: string;
  tag: string;
}

export function encryptData(data: unknown): EncryptedPayload {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
  const jsonStr = JSON.stringify(data);
  let encrypted = cipher.update(jsonStr, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag();

  return {
    iv: iv.toString('hex'),
    data: encrypted,
    tag: tag.toString('hex'),
  };
}

export function decryptData<T>(payload: EncryptedPayload): T | null {
  try {
    const iv = Buffer.from(payload.iv, 'hex');
    const tag = Buffer.from(payload.tag, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(payload.data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted) as T;
  } catch (err) {
    console.warn('[EncryptedDb] Decryption failed:', err);
    return null;
  }
}

export function writeEncryptedFile<T>(filePath: string, data: T): void {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const encrypted = encryptData(data);
    fs.writeFileSync(filePath, JSON.stringify(encrypted), 'utf8');
  } catch (err) {
    console.error('[EncryptedDb] Write failed:', err);
  }
}

export function readEncryptedFile<T>(filePath: string): T | null {
  try {
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, 'utf8');
    if (!raw.trim()) return null;
    const parsed = JSON.parse(raw) as EncryptedPayload;
    if (parsed.iv && parsed.data && parsed.tag) {
      return decryptData<T>(parsed);
    }
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn('[EncryptedDb] Read failed:', err);
    return null;
  }
}
