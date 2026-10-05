import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { CodeBlock } from '../../components/ui/CodeBlock';
import { EventLog } from '../../components/terminal/EventLog';
import type { LogEntry } from '../../components/terminal/EventLog';
import {
  computeRsaParameters,
  rsaEncryptNumber,
  rsaDecryptNumber,
  rsaEncryptText,
  rsaDecryptText
} from '../../lib/crypto/rsa';

export const RsaWorkbench: React.FC = () => {
  const [p, setP] = useState<string>('61');
  const [q, setQ] = useState<string>('53');
  const [e, setE] = useState<string>('17');
  const [msgNum, setMsgNum] = useState<string>('42');
  const [msgText, setMsgText] = useState<string>('CryptoLab');

  const [logs, setLogs] = useState<LogEntry[]>([
    { id: '1', timestamp: '00:00:01', source: 'RSA-ENGINE', message: 'Initialized RSA parameters: p=61, q=53, e=17', type: 'info' }
  ]);

  const addLog = (message: string, type: 'info' | 'success' | 'warn' | 'error' = 'info') => {
    const entry: LogEntry = {
      id: Date.now().toString() + Math.random(),
      timestamp: new Date().toTimeString().split(' ')[0],
      source: 'RSA-ENGINE',
      message,
      type
    };
    setLogs((prev) => [entry, ...prev.slice(0, 49)]);
  };

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

  // Numerical test
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

  // Text test
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

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <div className="flex items-center space-x-2">
          <h1 className="font-mono text-base font-bold text-slate-100 uppercase tracking-tight">
            RSA Cryptosystem Workbench
          </h1>
          <Badge variant="edu">EDUCATIONAL / INSECURE PARAMETERS</Badge>
        </div>
        <p className="font-mono text-xs text-slate-400 mt-0.5">
          Asymmetric encryption and key derivation based on the integer factorization problem and Euler's totient.
        </p>
      </div>

      {/* Parameter Input */}
      <Card title="KEY PARAMETERS (PRIME GENERATION)">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
          <div>
            <label className="text-[11px] text-slate-400 uppercase font-semibold">Prime Factor p</label>
            <input
              type="text"
              value={p}
              onChange={(e) => {
                setP(e.target.value);
                addLog(`Updated prime p=${e.target.value}`);
              }}
              className="w-full mt-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
            />
          </div>
          <div>
            <label className="text-[11px] text-slate-400 uppercase font-semibold">Prime Factor q</label>
            <input
              type="text"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                addLog(`Updated prime q=${e.target.value}`);
              }}
              className="w-full mt-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
            />
          </div>
          <div>
            <label className="text-[11px] text-slate-400 uppercase font-semibold">Public Exponent e</label>
            <input
              type="text"
              value={e}
              onChange={(e) => {
                setE(e.target.value);
                addLog(`Updated public exponent e=${e.target.value}`);
              }}
              className="w-full mt-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
            />
          </div>
        </div>

        {!rsaResult.success && (
          <div className="mt-3 p-2 bg-rose-950/40 border border-rose-800/80 rounded font-mono text-xs text-rose-300">
            {rsaResult.error}
          </div>
        )}
      </Card>

      {/* Derived Key Geometry */}
      {params && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 font-mono">
          <Card title="MODULUS n = p × q">
            <div className="text-xl font-bold text-sky-400">{params.n.toString()}</div>
            <div className="text-[11px] text-slate-500 mt-1">{p} × {q}</div>
          </Card>
          <Card title="TOTIENT φ(n) = (p-1)(q-1)">
            <div className="text-xl font-bold text-slate-300">{params.phi.toString()}</div>
            <div className="text-[11px] text-slate-500 mt-1">({p}-1) × ({q}-1)</div>
          </Card>
          <Card title="PUBLIC KEY (n, e)">
            <div className="text-xl font-bold text-emerald-400">({params.n.toString()}, {params.e.toString()})</div>
            <div className="text-[11px] text-slate-500 mt-1">Shared publicly</div>
          </Card>
          <Card title="PRIVATE KEY (n, d)">
            <div className="text-xl font-bold text-amber-400">({params.n.toString()}, {params.d.toString()})</div>
            <div className="text-[11px] text-slate-500 mt-1">d ≡ e⁻¹ mod φ(n)</div>
          </Card>
        </div>
      )}

      {/* Numerical Encryption/Decryption Experiment */}
      <Card title="NUMERICAL MESSAGE EXPERIMENT: c = m^e mod n  |  m = c^d mod n">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          <div>
            <label className="text-[11px] text-slate-400 uppercase font-semibold">Message Integer m (m &lt; n)</label>
            <input
              type="text"
              value={msgNum}
              onChange={(e) => {
                setMsgNum(e.target.value);
                addLog(`Numerical plaintext message set to m=${e.target.value}`);
              }}
              className="w-full mt-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
            />
            {numError && <div className="text-rose-400 text-[10px] mt-1">{numError}</div>}
          </div>

          <div>
            <div className="text-[11px] text-slate-400 uppercase font-semibold">Ciphertext c = m^e mod n</div>
            <div className="mt-1 p-2 bg-slate-950 border border-slate-800 rounded text-sky-400 font-bold text-sm">
              {numCipher.toString()}
            </div>
          </div>

          <div>
            <div className="text-[11px] text-slate-400 uppercase font-semibold">Decrypted m = c^d mod n</div>
            <div className="mt-1 p-2 bg-slate-950 border border-slate-800 rounded text-emerald-400 font-bold text-sm">
              {numRecovered.toString()}
            </div>
          </div>
        </div>

        {params && numRecovered.toString() === msgNum && (
          <div className="mt-3 p-2 bg-emerald-950/20 border border-emerald-800/60 rounded font-mono text-xs text-emerald-400">
            ✓ Modular exponentiation verified: ({numCipher.toString()}^{params.d.toString()}) mod {params.n.toString()} = {numRecovered.toString()}
          </div>
        )}
      </Card>

      {/* Text Encryption Experiment */}
      <Card title="TEXT STRING ENCRYPTION EXPERIMENT">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
          <div>
            <label className="text-[11px] text-slate-400 uppercase font-semibold">Plaintext Payload</label>
            <input
              type="text"
              value={msgText}
              onChange={(e) => {
                setMsgText(e.target.value);
                addLog(`Text payload updated: "${e.target.value}"`);
              }}
              className="w-full mt-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
            />
          </div>

          <div>
            <div className="text-[11px] text-slate-400 uppercase font-semibold">Recovered Decrypted String</div>
            <div className="mt-1 p-2 bg-slate-950 border border-slate-800 rounded text-emerald-400 font-bold">
              {textRecovered}
            </div>
          </div>
        </div>

        <div className="mt-3">
          <CodeBlock label="Encrypted Ciphertext Array (Char Integers)" value={JSON.stringify(textCiphers.map(c => c.toString()))} />
        </div>
      </Card>

      {/* Production RSA Technical Note */}
      <Card title="PRODUCTION RSA NOTE (OAEP PADDING & KEY SIZES)">
        <div className="font-mono text-xs text-slate-400 space-y-2 leading-relaxed">
          <p>
            Textbook RSA (c = m^e mod n) is deterministic: encrypting the same message twice produces the exact same ciphertext.
            In production applications, RSA requires a minimum of 2048-bit modulus size and randomized padding such as
            <span className="text-sky-300 font-semibold"> RSA-OAEP (Optimal Asymmetric Encryption Padding)</span> with SHA-256.
          </p>
          <div className="text-[11px] text-slate-500 border-t border-slate-800/80 pt-2">
            Standards: RFC 8017 (PKCS #1 v2.2) &bull; NIST SP 800-56B Rev. 2
          </div>
        </div>
      </Card>

      {/* Event Stream */}
      <EventLog logs={logs} onClear={() => setLogs([])} />
    </div>
  );
};
