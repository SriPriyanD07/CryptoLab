import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { SecurityStatus } from '../../components/workstation/SecurityStatus';
import { CryptoInspector } from '../../components/workstation/CryptoInspector';
import { AttackerView } from '../../components/workstation/AttackerView';
import { ProtocolTrace, type ProtocolEvent } from '../../components/terminal/ProtocolTrace';
import {
  computeRsaParameters,
  rsaEncryptNumber,
  rsaDecryptNumber,
  rsaEncryptText,
  rsaDecryptText
} from '../../lib/crypto/rsa';
import { extendedGcd, euclideanGcd, getModPowSteps } from '../../lib/crypto/modMath';
import { RefreshCw, Calculator } from 'lucide-react';

export const RsaWorkbench: React.FC = () => {
  // Prime factors and public exponent
  const [p, setP] = useState<string>('61');
  const [q, setQ] = useState<string>('53');
  const [e, setE] = useState<string>('17');

  // Plaintext inputs
  const [msgNum, setMsgNum] = useState<string>('42');
  const [msgText, setMsgText] = useState<string>('CryptoLab');

  // Computation inspection drawer state
  const [showComputeDrawer, setShowComputeDrawer] = useState<boolean>(false);

  // Protocol events
  const [events, setEvents] = useState<ProtocolEvent[]>([
    {
      id: 'init-1',
      timestamp: '00:00:01',
      actor: 'SYSTEM',
      action: 'RSA parameters initialized: p=61, q=53, e=17',
      direction: 'internal',
      status: 'info'
    },
    {
      id: 'init-2',
      timestamp: '00:00:01',
      actor: 'SYSTEM',
      action: 'Modulus calculated: n = p * q = 3233',
      direction: 'internal',
      status: 'info'
    },
    {
      id: 'init-3',
      timestamp: '00:00:01',
      actor: 'SYSTEM',
      action: 'Euler totient calculated: φ(n) = (p-1)*(q-1) = 3120',
      direction: 'internal',
      status: 'info'
    },
    {
      id: 'init-4',
      timestamp: '00:00:02',
      actor: 'SYSTEM',
      action: 'Public exponent validated: gcd(e, φ(n)) = 1 (coprime)',
      direction: 'internal',
      status: 'success'
    },
    {
      id: 'init-5',
      timestamp: '00:00:02',
      actor: 'SYSTEM',
      action: 'Private exponent derived via Extended GCD: d = 2753',
      direction: 'internal',
      status: 'success',
      metadata: { d: '2753' }
    },
    {
      id: 'init-6',
      timestamp: '00:00:03',
      actor: 'ALICE',
      action: 'Message encoded: m = 42',
      direction: 'internal',
      status: 'info'
    },
    {
      id: 'init-7',
      timestamp: '00:00:03',
      actor: 'ALICE',
      action: 'Message encrypted: c = m^e mod n = 42^17 mod 3233 = 2557',
      direction: 'outbound',
      status: 'success'
    },
    {
      id: 'init-8',
      timestamp: '00:00:04',
      actor: 'BOB',
      action: 'Ciphertext decrypted: m = c^d mod n = 2557^2753 mod 3233 = 42',
      direction: 'inbound',
      status: 'success'
    },
    {
      id: 'init-9',
      timestamp: '00:00:05',
      actor: 'SYSTEM',
      action: 'Decryption integrity verified: recovered plaintext matches original',
      direction: 'internal',
      status: 'success'
    }
  ]);

  const addEvent = (
    actor: 'ALICE' | 'BOB' | 'SYSTEM' | 'NETWORK',
    action: string,
    direction: 'outbound' | 'inbound' | 'internal' = 'internal',
    status: 'info' | 'success' | 'warn' | 'error' = 'info',
    metadata?: Record<string, string | number | boolean>
  ) => {
    const newEvt: ProtocolEvent = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toTimeString().split(' ')[0],
      actor,
      action,
      direction,
      status,
      metadata
    };
    setEvents((prev) => [newEvt, ...prev.slice(0, 49)]);
  };

  // BigInt parsing
  let bigP = 61n, bigQ = 53n, bigE = 17n;
  try {
    bigP = BigInt(p);
    bigQ = BigInt(q);
    bigE = BigInt(e);
  } catch {
    // fallback
  }

  const rsaResult = computeRsaParameters(bigP, bigQ, bigE);
  const params = rsaResult.params;

  // Numerical encryption & decryption
  let numCipher = 0n;
  let numRecovered = 0n;
  let numError = '';
  if (params) {
    try {
      const m = BigInt(msgNum);
      numCipher = rsaEncryptNumber(m, params.e, params.n);
      numRecovered = rsaDecryptNumber(numCipher, params.d, params.n);
    } catch (err: any) {
      numError = err.message || 'Numerical encryption error';
    }
  }

  // Text encryption & decryption
  let textCiphers: bigint[] = [];
  let textRecovered = '';
  if (params) {
    try {
      textCiphers = rsaEncryptText(msgText, params.e, params.n);
      textRecovered = rsaDecryptText(textCiphers, params.d, params.n);
    } catch {
      // fallback
    }
  }

  // Precompute computation traces for the inspector
  const gcdTrace = params ? euclideanGcd(params.e, params.phi) : null;
  const extGcdTrace = params ? extendedGcd(params.e, params.phi) : null;
  const expTrace = params && !numError ? getModPowSteps(BigInt(msgNum || '1'), params.e, params.n) : null;

  const handleRandomizePrimes = () => {
    const primeList = [17n, 19n, 23n, 29n, 31n, 37n, 41n, 43n, 47n, 53n, 59n, 61n, 67n, 71n];
    const pIdx = Math.floor(Math.random() * primeList.length);
    let qIdx = Math.floor(Math.random() * primeList.length);
    while (qIdx === pIdx) {
      qIdx = Math.floor(Math.random() * primeList.length);
    }
    const newP = primeList[pIdx];
    const newQ = primeList[qIdx];
    const phi = (newP - 1n) * (newQ - 1n);

    // Find small coprime e
    const candidates = [3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 65537n];
    let validE = 17n;
    for (const cand of candidates) {
      if (cand < phi && euclideanGcd(cand, phi).gcd === 1n) {
        validE = cand;
        break;
      }
    }

    setP(newP.toString());
    setQ(newQ.toString());
    setE(validE.toString());

    addEvent('SYSTEM', `Selected new primes: p=${newP}, q=${newQ}, e=${validE}`, 'internal', 'info');
    addEvent('SYSTEM', `Computed modulus: n = ${newP * newQ}, φ(n) = ${phi}`, 'internal', 'info');
  };

  const handleReset = () => {
    setP('61');
    setQ('53');
    setE('17');
    setMsgNum('42');
    setMsgText('CryptoLab');
    setEvents([
      {
        id: 'reset-1',
        timestamp: new Date().toTimeString().split(' ')[0],
        actor: 'SYSTEM',
        action: 'Reset RSA parameters to default: p=61, q=53, e=17',
        direction: 'internal',
        status: 'info'
      }
    ]);
  };

  const isNumericVerified = params && !numError && numRecovered.toString() === msgNum;

  return (
    <div className="space-y-4 font-mono text-xs select-none">
      {/* Workbench Header */}
      <div className="border border-[#20252b] bg-[#090b0e] rounded-[2px] p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0"></span>
            <h1 className="font-mono text-xs font-bold tracking-wider text-[#e6e7e9] uppercase">
              RSA CRYPTOSYSTEM WORKBENCH
            </h1>
            <Badge variant="edu">EDUCATIONAL PARAMETERS — NOT PRODUCTION RSA</Badge>
          </div>
          <p className="font-mono text-[10px] text-[#8b929a] mt-0.5">
            Public-key cryptography and trapdoor permutation based on the integer factorization problem and Euler's totient.
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex items-center space-x-1.5 shrink-0">
          <button
            onClick={() => setShowComputeDrawer((prev) => !prev)}
            className={`flex items-center space-x-1 text-[10px] font-mono font-medium px-2 py-1 rounded-[2px] border transition-colors ${
              showComputeDrawer
                ? 'bg-[#161a20] text-[#e6e7e9] border-[#e6e7e9]'
                : 'bg-[#11151a] hover:bg-[#161b22] text-[#8b929a] border-[#20252b]'
            }`}
            title="Inspect internal mathematical steps"
          >
            <Calculator className="w-3 h-3 text-[#8b929a]" />
            <span>{showComputeDrawer ? 'HIDE DERIVATION' : 'INSPECT DERIVATION'}</span>
          </button>
          <button
            onClick={handleRandomizePrimes}
            className="flex items-center space-x-1 text-[10px] font-mono font-medium px-2 py-1 rounded-[2px] bg-[#11151a] hover:bg-[#161b22] text-[#e6e7e9] border border-[#20252b] transition-colors"
            title="Generate prime pair (p, q)"
          >
            <RefreshCw className="w-3 h-3 text-[#8b929a]" />
            <span>RANDOMIZE PRIMES</span>
          </button>
          <button
            onClick={handleReset}
            className="flex items-center space-x-1 text-[10px] font-mono font-medium px-2 py-1 rounded-[2px] bg-[#11151a] hover:bg-[#161b22] text-[#8b929a] border border-[#20252b] transition-colors"
            title="Reset workbench to defaults"
          >
            <span>RESET</span>
          </button>
        </div>
      </div>

      {/* Security Status Rail */}
      <div className="mb-4">
        <SecurityStatus
          title="RSA KEYPAIR & CIPHER STATUS"
          encryption={params ? 'complete' : 'failed'}
          authentication={isNumericVerified ? 'verified' : 'failed'}
          customItems={[
            {
              id: 'primes',
              label: 'PRIME FACTORS (p, q)',
              status: rsaResult.success ? 'established' : 'failed',
              detail: `p=${p}, q=${q}`
            },
            {
              id: 'modulus',
              label: 'MODULUS (n = p × q)',
              status: params ? 'complete' : 'failed',
              detail: params ? `n=${params.n.toString()}` : 'Error'
            },
            {
              id: 'totient',
              label: 'COPRIMALITY gcd(e, φ)',
              status: params ? 'verified' : 'failed',
              detail: params ? `gcd=1` : 'Not Coprime'
            },
            {
              id: 'priv_d',
              label: 'TRAPDOOR INVERSE (d)',
              status: params ? 'established' : 'failed',
              detail: params ? `d=${params.d.toString()}` : 'No Inverse'
            },
            {
              id: 'cipher_roundtrip',
              label: 'DECRYPTION VERIFIED',
              status: isNumericVerified ? 'verified' : 'failed',
              detail: isNumericVerified ? 'm == m\'' : 'Pending/Mismatch'
            }
          ]}
        />
      </div>

      {/* Main 3-Column Standard Workstation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(250px,1fr)_minmax(380px,1.4fr)_minmax(280px,1fr)] xl:grid-cols-[minmax(260px,1fr)_minmax(420px,1.5fr)_minmax(300px,1fr)] gap-4 items-start">
        {/* Column 1: Input Parameters & Payloads */}
        <div className="space-y-4 min-w-0">
          <Card title="KEY GENERATION PARAMETERS">
            <div className="space-y-2.5 font-mono text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-[#8b929a] uppercase font-medium">Prime Factor (p)</label>
                  <input
                    type="text"
                    value={p}
                    onChange={(e) => setP(e.target.value)}
                    className="w-full mt-1 bg-[#090b0e] border border-[#20252b] rounded-[2px] px-2 py-1 text-[#e6e7e9] focus:outline-none focus:border-[#8b929a] font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#8b929a] uppercase font-medium">Prime Factor (q)</label>
                  <input
                    type="text"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    className="w-full mt-1 bg-[#090b0e] border border-[#20252b] rounded-[2px] px-2 py-1 text-[#e6e7e9] focus:outline-none focus:border-[#8b929a] font-mono text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] text-[#8b929a] uppercase font-medium">Public Exponent (e)</label>
                <input
                  type="text"
                  value={e}
                  onChange={(e) => setE(e.target.value)}
                  className="w-full mt-1 bg-[#090b0e] border border-[#20252b] rounded-[2px] px-2 py-1 text-[#e6e7e9] focus:outline-none focus:border-[#8b929a] font-mono text-xs"
                />
              </div>

              {/* Error banner if parameters are invalid */}
              {!rsaResult.success && (
                <div className="p-2 rounded-[2px] bg-rose-950/40 border border-rose-800 text-rose-300 text-[10px] font-mono">
                  Error: {rsaResult.error}
                </div>
              )}
            </div>
          </Card>

          <Card title="PLAINTEXT PAYLOAD INPUTS">
            <div className="space-y-2.5 font-mono text-xs">
              <div>
                <label className="text-[10px] text-[#8b929a] uppercase font-medium">
                  Plaintext Numerical Integer (m &lt; n)
                </label>
                <input
                  type="text"
                  value={msgNum}
                  onChange={(e) => setMsgNum(e.target.value)}
                  className="w-full mt-1 bg-[#090b0e] border border-[#20252b] rounded-[2px] px-2 py-1 text-[#e6e7e9] focus:outline-none focus:border-[#8b929a] font-mono text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] text-[#8b929a] uppercase font-medium">Plaintext String</label>
                <input
                  type="text"
                  value={msgText}
                  onChange={(e) => setMsgText(e.target.value)}
                  className="w-full mt-1 bg-[#090b0e] border border-[#20252b] rounded-[2px] px-2 py-1 text-[#e6e7e9] focus:outline-none focus:border-[#8b929a] font-mono text-xs"
                />
              </div>
            </div>
          </Card>

          <div className="p-2.5 rounded-[2px] bg-[#0d1014] border border-[#20252b] text-[10px] text-[#8b929a] font-mono">
            <span className="text-amber-400 font-medium uppercase mr-1.5">Note:</span>
            Small parameters expose textbook RSA mathematics. Real-world RSA requires standardized padding (OAEP/PSS) and &ge; 2048-bit keys.
          </div>
        </div>

        {/* Column 2: Protocol Transformations & Computation */}
        <div className="space-y-4 min-w-0">
          <Card title="NUMERICAL MESSAGE TRANSFORMATION (m^e mod n ⟶ c^d mod n)">
            <div className="space-y-2 font-mono text-xs">
              {numError ? (
                <div className="p-2 rounded-[2px] bg-rose-950/40 border border-rose-800 text-rose-300 text-[10px]">
                  {numError}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="p-2 rounded-[2px] bg-[#090b0e] border border-[#20252b]">
                    <div className="text-[9px] text-[#5f6670] uppercase font-semibold">
                      ALICE ENCRYPTS: c = m^e mod n
                    </div>
                    <div className="mt-1 text-[#e6e7e9] font-mono text-xs break-all">
                      {msgNum}^{e} mod {params?.n.toString() || '0'} = <span className="font-bold">{numCipher.toString()}</span>
                    </div>
                    <div className="text-[9px] text-slate-500 mt-0.5">Public wire ciphertext</div>
                  </div>

                  <div className="p-2 rounded-[2px] bg-[#06090e] border border-emerald-900/40">
                    <div className="text-[9px] text-emerald-400 uppercase font-semibold">
                      BOB DECRYPTS: m' = c^d mod n
                    </div>
                    <div className="mt-1 text-emerald-400 font-mono text-xs break-all">
                      {numCipher.toString()}^{params?.d.toString() || '0'} mod {params?.n.toString() || '0'} = <span className="font-bold">{numRecovered.toString()}</span>
                    </div>
                    <div className="text-[9px] text-slate-500 mt-0.5">
                      {isNumericVerified ? '✓ Recovered original integer' : 'Pending decryption'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          <Card title="STRING TEXT ENCRYPTION (CHARACTER ENCODING)">
            <div className="space-y-2 font-mono text-xs">
              <div className="p-2 rounded-[2px] bg-[#090b0e] border border-[#20252b]">
                <div className="text-[9px] text-[#5f6670] uppercase font-semibold">Ciphertext Integers:</div>
                <div className="mt-1 font-mono text-[#e6e7e9] break-all text-[11px]">
                  [{textCiphers.map((c) => c.toString()).join(', ')}]
                </div>
              </div>
              <div className="p-2 rounded-[2px] bg-[#090b0e] border border-emerald-900/40">
                <div className="text-[9px] text-emerald-400 uppercase font-semibold">Decrypted String:</div>
                <div className="mt-1 font-mono text-emerald-400 font-bold text-xs">
                  "{textRecovered}"
                </div>
              </div>
            </div>
          </Card>

          {/* Computation Derivations */}
          {showComputeDrawer && (
            <Card
              title="MATHEMATICAL COMPUTATION DERIVATION"
              badge={<Badge variant="edu">NUMBER THEORY</Badge>}
            >
              <div className="space-y-2.5 font-mono text-[10px]">
                <div className="p-2 rounded-[2px] bg-[#090b0e] border border-[#20252b] space-y-1">
                  <div className="text-[#e6e7e9] font-semibold uppercase text-[10px]">
                    1. Totient: φ(n) = (p-1)(q-1)
                  </div>
                  <div className="text-[#cbd5e1] text-[10px]">
                    φ(n) = ({p}-1)×({q}-1) = {params?.phi.toString()} | gcd({e}, {params?.phi.toString()}) = {gcdTrace?.gcd.toString()}
                  </div>
                </div>

                <div className="p-2 rounded-[2px] bg-[#090b0e] border border-[#20252b] space-y-1">
                  <div className="text-[#e6e7e9] font-semibold uppercase text-[10px]">
                    2. Modular Inverse: d ≡ e⁻¹ mod φ(n)
                  </div>
                  <div className="text-[#cbd5e1] text-[10px]">
                    {e} × d ≡ 1 (mod {params?.phi.toString()}) ⟶ <span className="text-emerald-400 font-bold">d = {params?.d.toString()}</span>
                  </div>
                  {extGcdTrace && (
                    <div className="text-[#5f6670] text-[9px]">
                      Bézout: ({e})×({extGcdTrace.x.toString()}) + ({params?.phi.toString()})×({extGcdTrace.y.toString()}) = 1
                    </div>
                  )}
                </div>

                {expTrace && (
                  <div className="p-2 rounded-[2px] bg-[#090b0e] border border-[#20252b] space-y-1">
                    <div className="text-[#e6e7e9] font-semibold uppercase text-[10px]">
                      3. Modular Exp: {msgNum}^{e} mod {params?.n.toString()}
                    </div>
                    <div className="text-[#8b929a] text-[9px]">
                      Binary: {expTrace.binaryExp} ({expTrace.steps.length} ops)
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Column 3: CryptoInspector & Attacker Perspective */}
        <div className="space-y-4 min-w-0">
          <CryptoInspector
            title="RSA KEY & PARAMETER INSPECTOR"
            protocol="RSA (Textbook Modular)"
            sections={[
              {
                id: 'primes',
                title: 'PRIME FACTORS',
                fields: [
                  { id: 'p', label: 'Prime Factor (p)', value: p, copyable: true },
                  { id: 'q', label: 'Prime Factor (q)', value: q, copyable: true }
                ]
              },
              {
                id: 'derived',
                title: 'DERIVED TOTALS',
                fields: [
                  { id: 'n', label: 'Modulus n = p × q', value: params?.n.toString() || '—', copyable: true },
                  { id: 'phi', label: 'Totient φ(n)', value: params?.phi.toString() || '—', copyable: true }
                ]
              },
              {
                id: 'keys',
                title: 'KEYPAIR (PUBLIC / PRIVATE)',
                fields: [
                  { id: 'e', label: 'Public Exponent (e)', value: e, copyable: true, tag: 'PUBLIC' },
                  {
                    id: 'd',
                    label: 'Private Exponent (d)',
                    value: params?.d.toString() || '—',
                    sensitive: true,
                    copyable: true,
                    tag: 'SECRET'
                  }
                ]
              }
            ]}
          />

          <AttackerView
            title="ATTACKER PERSPECTIVE & TRANSCRIPT"
            threatModel="Passive Wire Eavesdropper observing public parameters and ciphertext"
            observable={[
              {
                id: 'obs_n',
                label: 'Public Modulus (n)',
                value: params?.n.toString() || '—',
                detail: 'Transmitted as part of public key'
              },
              {
                id: 'obs_e',
                label: 'Public Exponent (e)',
                value: e,
                detail: 'Publicly known encryption exponent'
              },
              {
                id: 'obs_c',
                label: 'Ciphertext (c)',
                value: numCipher.toString(),
                detail: 'Transmitted across the unencrypted wire'
              }
            ]}
            protectedItems={[
              {
                id: 'prot_p_q',
                label: 'Prime Factors (p, q)',
                detail: 'Private decomposition of composite modulus n'
              },
              {
                id: 'prot_phi',
                label: 'Euler Totient φ(n)',
                detail: 'Requires factorization of n: φ(n) = (p-1)(q-1)'
              },
              {
                id: 'prot_d',
                label: 'Private Decryption Exponent (d)',
                detail: 'Trapdoor inversion: d ≡ e⁻¹ mod φ(n)'
              },
              {
                id: 'prot_m',
                label: 'Decrypted Plaintext (m)',
                detail: 'Protected by the integer factorization problem'
              }
            ]}
            notes="Security relies on the computational intractability of factoring the composite modulus n into prime factors p and q."
          />

          {/* Key Summary Box */}
          <div className="p-2.5 rounded-[2px] bg-[#0d1014] border border-[#20252b] font-mono text-xs space-y-2">
            <div className="text-[10px] font-semibold text-[#e6e7e9] uppercase tracking-wider">Cryptographic Key Envelopes</div>
            <div className="p-1.5 rounded-[2px] bg-[#090b0e] border border-[#20252b]">
              <span className="text-[#8b929a] text-[9px] uppercase block font-medium">Public Key (n, e):</span>
              <span className="text-[#e6e7e9] font-bold text-xs">({params?.n.toString() || '—'}, {e})</span>
            </div>
            <div className="p-1.5 rounded-[2px] bg-[#090b0e] border border-[#20252b]">
              <span className="text-[#8b929a] text-[9px] uppercase block font-medium">Private Key (n, d):</span>
              <span className="text-amber-400 font-bold text-xs">({params?.n.toString() || '—'}, {params?.d ? '••••' : '—'})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Full-Width Column: Protocol Trace */}
      <div className="mt-4">
        <ProtocolTrace
          title="RSA PROTOCOL EXECUTION TRACE"
          events={events}
          onClear={() => setEvents([])}
        />
      </div>
    </div>
  );
};
