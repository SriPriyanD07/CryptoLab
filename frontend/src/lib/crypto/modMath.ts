/**
 * Precision Modular Arithmetic & Number Theory Engine (BigInt based).
 */

export interface StepTrace {
  x: string;
  y: string;
  quotient: string;
  remainder: string;
}

export interface ExtendedGcdStep {
  old_r: string;
  r: string;
  q: string;
  old_s: string;
  s: string;
  old_t: string;
  t: string;
}

export function mod(n: bigint, m: bigint): bigint {
  const result = n % m;
  return result >= 0n ? result : result + m;
}

export function modPow(base: bigint, exp: bigint, m: bigint): bigint {
  if (m === 1n) return 0n;
  let result = 1n;
  let b = mod(base, m);
  let e = exp;

  while (e > 0n) {
    if (e % 2n === 1n) {
      result = mod(result * b, m);
    }
    b = mod(b * b, m);
    e = e / 2n;
  }
  return result;
}

export function getModPowSteps(base: bigint, exp: bigint, m: bigint) {
  const binaryExp = exp.toString(2);
  const steps = [];
  let result = 1n;
  let currentBase = mod(base, m);

  for (let i = binaryExp.length - 1; i >= 0; i--) {
    const bit = binaryExp[i];
    const stepBeforeResult = result;
    const stepBeforeBase = currentBase;

    if (bit === '1') {
      result = mod(result * currentBase, m);
    }
    currentBase = mod(currentBase * currentBase, m);

    steps.push({
      step: binaryExp.length - 1 - i,
      bit,
      base_before: stepBeforeBase.toString(),
      result_before: stepBeforeResult.toString(),
      result_after: result.toString(),
      base_after: currentBase.toString()
    });
  }

  return {
    binaryExp,
    result: modPow(base, exp, m),
    steps
  };
}

export function euclideanGcd(a: bigint, b: bigint): { gcd: bigint; steps: StepTrace[] } {
  const steps: StepTrace[] = [];
  let x = a < 0n ? -a : a;
  let y = b < 0n ? -b : b;

  while (y !== 0n) {
    const q = x / y;
    const r = x % y;
    steps.push({
      x: x.toString(),
      y: y.toString(),
      quotient: q.toString(),
      remainder: r.toString()
    });
    x = y;
    y = r;
  }
  return { gcd: x, steps };
}

export function extendedGcd(a: bigint, b: bigint): { gcd: bigint; x: bigint; y: bigint; steps: ExtendedGcdStep[] } {
  const steps: ExtendedGcdStep[] = [];
  let old_r = a, r = b;
  let old_s = 1n, s = 0n;
  let old_t = 0n, t = 1n;

  while (r !== 0n) {
    const q = old_r / r;
    steps.push({
      old_r: old_r.toString(),
      r: r.toString(),
      q: q.toString(),
      old_s: old_s.toString(),
      s: s.toString(),
      old_t: old_t.toString(),
      t: t.toString()
    });
    const temp_r = r;
    r = old_r - q * r;
    old_r = temp_r;

    const temp_s = s;
    s = old_s - q * s;
    old_s = temp_s;

    const temp_t = t;
    t = old_t - q * t;
    old_t = temp_t;
  }

  return { gcd: old_r, x: old_s, y: old_t, steps };
}

export function modInverse(a: bigint, m: bigint): { exists: boolean; inverse: bigint | null; gcd: bigint } {
  if (m <= 1n) return { exists: false, inverse: null, gcd: 0n };
  const { gcd, x } = extendedGcd(a, m);
  if (gcd !== 1n) {
    return { exists: false, inverse: null, gcd };
  }
  return { exists: true, inverse: mod(x, m), gcd };
}
