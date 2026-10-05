import { modPow, modInverse, euclideanGcd } from './modMath';

export interface EducationalRsaParams {
  p: bigint;
  q: bigint;
  n: bigint;
  phi: bigint;
  e: bigint;
  d: bigint;
}

export function computeRsaParameters(p: bigint, q: bigint, e: bigint): { success: boolean; params?: EducationalRsaParams; error?: string } {
  if (p <= 1n || q <= 1n) {
    return { success: false, error: 'p and q must be prime integers greater than 1.' };
  }
  const n = p * q;
  const phi = (p - 1n) * (q - 1n);

  const { gcd } = euclideanGcd(e, phi);
  if (gcd !== 1n) {
    return { success: false, error: `Public exponent e=${e} is not coprime to φ(n)=${phi} (gcd=${gcd}).` };
  }

  const inv = modInverse(e, phi);
  if (!inv.exists || inv.inverse === null) {
    return { success: false, error: `Modular inverse d does not exist for e=${e} mod φ(n)=${phi}.` };
  }

  return {
    success: true,
    params: {
      p,
      q,
      n,
      phi,
      e,
      d: inv.inverse
    }
  };
}

export function rsaEncryptNumber(m: bigint, e: bigint, n: bigint): bigint {
  if (m >= n) throw new Error(`Message m (${m}) must be smaller than modulus n (${n}).`);
  return modPow(m, e, n);
}

export function rsaDecryptNumber(c: bigint, d: bigint, n: bigint): bigint {
  return modPow(c, d, n);
}

export function rsaEncryptText(text: string, e: bigint, n: bigint): bigint[] {
  return Array.from(text).map(char => rsaEncryptNumber(BigInt(char.charCodeAt(0)), e, n));
}

export function rsaDecryptText(cArray: bigint[], d: bigint, n: bigint): string {
  return cArray.map(c => String.fromCharCode(Number(rsaDecryptNumber(c, d, n)))).join('');
}
