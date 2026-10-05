import { modPow } from './modMath';

export interface DhExchangeState {
  p: bigint;
  g: bigint;
  a: bigint;
  b: bigint;
  A: bigint;
  B: bigint;
  sharedAlice: bigint;
  sharedBob: bigint;
  match: boolean;
}

export function executeDhExchange(p: bigint, g: bigint, a: bigint, b: bigint): DhExchangeState {
  const A = modPow(g, a, p);
  const B = modPow(g, b, p);

  const sharedAlice = modPow(B, a, p);
  const sharedBob = modPow(A, b, p);

  return {
    p,
    g,
    a,
    b,
    A,
    B,
    sharedAlice,
    sharedBob,
    match: sharedAlice === sharedBob
  };
}
