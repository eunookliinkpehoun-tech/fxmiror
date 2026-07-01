"""
Decrypt MT5 passwords produced by the Next.js app (lib/crypto.ts).

Storage format (base64):  iv(12) | authTag(16) | ciphertext
AES-256-GCM. The key is MT5_ENC_KEY (base64 of 32 bytes), identical on both sides.
"""
import base64
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from config import MT5_ENC_KEY

_KEY = base64.b64decode(MT5_ENC_KEY)
if len(_KEY) != 32:
    raise RuntimeError("MT5_ENC_KEY must decode to 32 bytes.")


def decrypt_secret(payload: str) -> str:
    raw = base64.b64decode(payload)
    iv = raw[0:12]
    tag = raw[12:28]
    ciphertext = raw[28:]
    # Python's AESGCM expects ciphertext WITH the tag appended at the end.
    plaintext = AESGCM(_KEY).decrypt(iv, ciphertext + tag, None)
    return plaintext.decode("utf-8")
