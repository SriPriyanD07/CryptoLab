/**
 * High-performance Web Crypto API wrappers for modern cryptographic primitives.
 */

// Utility functions for ArrayBuffer <-> Hex / Base64 conversions
export function bufferToHex(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export function hexToBuffer(hex: string): Uint8Array {
  const clean = hex.replace(/[^0-9a-fA-F]/g, '');
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < clean.length; i += 2) {
    bytes[i / 2] = parseInt(clean.substring(i, i + 2), 16);
  }
  return bytes;
}

export function bufferToBinaryString(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  return Array.from(bytes)
    .map(b => b.toString(2).padStart(8, '0'))
    .join('');
}

// ----------------- SHA-256 -----------------

export async function computeSha256(text: string): Promise<{ hex: string; binary: string; bytesLen: number }> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hex = bufferToHex(hashBuffer);
  const binary = bufferToBinaryString(hashBuffer);
  return { hex, binary, bytesLen: hashBuffer.byteLength };
}

export async function computeAvalanche(textA: string, textB: string) {
  const resA = await computeSha256(textA);
  const resB = await computeSha256(textB);

  let differingBits = 0;
  const len = Math.min(resA.binary.length, resB.binary.length);
  for (let i = 0; i < len; i++) {
    if (resA.binary[i] !== resB.binary[i]) {
      differingBits++;
    }
  }

  const percentage = Number(((differingBits / 256) * 100).toFixed(2));

  return {
    textA,
    textB,
    hashA: resA.hex,
    hashB: resB.hex,
    binaryA: resA.binary,
    binaryB: resB.binary,
    differingBits,
    percentage
  };
}

// ----------------- AES-GCM (AEAD) -----------------

export async function generateAesKey(): Promise<{ key: CryptoKey; rawHex: string }> {
  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  const raw = await crypto.subtle.exportKey('raw', key);
  return { key, rawHex: bufferToHex(raw) };
}

export function generateNonce(length: number = 12): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(length));
}

export async function aesGcmEncrypt(
  plaintext: string,
  key: CryptoKey,
  nonce: Uint8Array,
  aad?: string
): Promise<{ ciphertextHex: string; tagHex: string; fullHex: string }> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);
  const additionalData = aad ? (encoder.encode(aad) as unknown as BufferSource) : undefined;

  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: nonce as unknown as BufferSource,
      additionalData,
      tagLength: 128
    },
    key,
    data
  );

  const fullBytes = new Uint8Array(encryptedBuffer);
  // Web Crypto appends the 16-byte tag to the ciphertext
  const ciphertextBytes = fullBytes.slice(0, fullBytes.length - 16);
  const tagBytes = fullBytes.slice(fullBytes.length - 16);

  return {
    ciphertextHex: bufferToHex(ciphertextBytes),
    tagHex: bufferToHex(tagBytes),
    fullHex: bufferToHex(fullBytes)
  };
}

export async function aesGcmDecrypt(
  ciphertextHex: string,
  tagHex: string,
  nonceHex: string,
  key: CryptoKey,
  aad?: string
): Promise<{ success: boolean; plaintext?: string; error?: string }> {
  try {
    const encoder = new TextEncoder();
    const additionalData = aad ? (encoder.encode(aad) as unknown as BufferSource) : undefined;
    const nonce = hexToBuffer(nonceHex);
    const ciphertext = hexToBuffer(ciphertextHex);
    const tag = hexToBuffer(tagHex);

    const combined = new Uint8Array(ciphertext.length + tag.length);
    combined.set(ciphertext, 0);
    combined.set(tag, ciphertext.length);

    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: nonce as unknown as BufferSource,
        additionalData,
        tagLength: 128
      },
      key,
      combined as unknown as BufferSource
    );

    const decoder = new TextDecoder();
    return {
      success: true,
      plaintext: decoder.decode(decryptedBuffer)
    };
  } catch {
    return {
      success: false,
      error: 'Authentication failed: ciphertext, authentication tag, or associated data was modified.'
    };
  }
}

// ----------------- ECDH (P-256) -----------------

export async function generateEcdhKeypair(): Promise<{ keypair: CryptoKeyPair; pubHex: string }> {
  const keypair = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveKey', 'deriveBits']
  );
  const rawPub = await crypto.subtle.exportKey('raw', keypair.publicKey);
  return { keypair, pubHex: bufferToHex(rawPub) };
}

export async function deriveEcdhSharedSecret(privateKey: CryptoKey, publicKey: CryptoKey): Promise<{ rawBitsHex: string; aesKey: CryptoKey }> {
  // Derive raw 256 bits of shared secret
  const bits = await crypto.subtle.deriveBits(
    { name: 'ECDH', public: publicKey },
    privateKey,
    256
  );
  // Also derive an AES-GCM session key directly
  const aesKey = await crypto.subtle.deriveKey(
    { name: 'ECDH', public: publicKey },
    privateKey,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );

  return {
    rawBitsHex: bufferToHex(bits),
    aesKey
  };
}

export async function deriveHkdfKeyFromBits(rawBits: Uint8Array, infoString: string = 'CryptoLab-v1.0-Session-Key'): Promise<{ sessionKeyHex: string }> {
  const baseKey = await crypto.subtle.importKey(
    'raw',
    rawBits as unknown as BufferSource,
    'HKDF',
    false,
    ['deriveBits']
  );
  const derived = await crypto.subtle.deriveBits(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: new Uint8Array(32) as unknown as BufferSource,
      info: new TextEncoder().encode(infoString) as unknown as BufferSource
    },
    baseKey,
    256
  );
  return { sessionKeyHex: bufferToHex(derived) };
}

// ----------------- ECDSA (P-256) -----------------

export async function generateEcdsaKeypair(): Promise<{ keypair: CryptoKeyPair; pubHex: string }> {
  const keypair = await crypto.subtle.generateKey(
    { name: 'ECDSA', namedCurve: 'P-256' },
    true,
    ['sign', 'verify']
  );
  const rawPub = await crypto.subtle.exportKey('raw', keypair.publicKey);
  return { keypair, pubHex: bufferToHex(rawPub) };
}

export async function ecdsaSign(privateKey: CryptoKey, message: string): Promise<{ sigHex: string; rHex: string; sHex: string }> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);

  const sigBuffer = await crypto.subtle.sign(
    { name: 'ECDSA', hash: { name: 'SHA-256' } },
    privateKey,
    data
  );

  const sigBytes = new Uint8Array(sigBuffer);
  // In Web Crypto P-256, signature is raw 64 bytes (r: 32 bytes, s: 32 bytes)
  const rBytes = sigBytes.slice(0, 32);
  const sBytes = sigBytes.slice(32, 64);

  return {
    sigHex: bufferToHex(sigBuffer),
    rHex: bufferToHex(rBytes),
    sHex: bufferToHex(sBytes)
  };
}

export async function ecdsaVerify(publicKey: CryptoKey, sigHex: string, message: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const sigBytes = hexToBuffer(sigHex);

    return await crypto.subtle.verify(
      { name: 'ECDSA', hash: { name: 'SHA-256' } },
      publicKey,
      sigBytes as unknown as BufferSource,
      data
    );
  } catch {
    return false;
  }
}
