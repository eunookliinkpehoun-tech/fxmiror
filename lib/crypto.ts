import "server-only"
import crypto from "node:crypto"

/**
 * AES-256-GCM encryption for MT5 passwords stored in MySQL.
 *
 * The web app encrypts MT5 passwords before storing them. The Python engine
 * decrypts them with the SAME key to log in to each user's terminal.
 *
 * Generate a key once and put it in BOTH the Next.js env and the Python env:
 *   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
 *   MT5_ENC_KEY=<the base64 value>
 *
 * Stored format (base64 string):  iv(12) | authTag(16) | ciphertext
 */
function getKey(): Buffer {
  const raw = process.env.MT5_ENC_KEY
  if (!raw) {
    throw new Error("MT5_ENC_KEY is not set. Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('base64'))\"")
  }
  const key = Buffer.from(raw, "base64")
  if (key.length !== 32) {
    throw new Error("MT5_ENC_KEY must decode to exactly 32 bytes (base64 of 32 random bytes).")
  }
  return key
}

export function encryptSecret(plain: string): string {
  const key = getKey()
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv)
  const ciphertext = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()])
  const authTag = cipher.getAuthTag()
  return Buffer.concat([iv, authTag, ciphertext]).toString("base64")
}

export function decryptSecret(payload: string): string {
  const key = getKey()
  const data = Buffer.from(payload, "base64")
  const iv = data.subarray(0, 12)
  const authTag = data.subarray(12, 28)
  const ciphertext = data.subarray(28)
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv)
  decipher.setAuthTag(authTag)
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8")
}
