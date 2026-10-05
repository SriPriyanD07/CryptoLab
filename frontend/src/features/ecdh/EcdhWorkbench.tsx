import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { CodeBlock } from '../../components/ui/CodeBlock';
import { EventLog } from '../../components/terminal/EventLog';
import type { LogEntry } from '../../components/terminal/EventLog';
import {
  generateEcdhKeypair,
  deriveEcdhSharedSecret
} from '../../lib/crypto/webCrypto';
import { RefreshCw } from 'lucide-react';

export const EcdhWorkbench: React.FC = () => {
  const [alicePubHex, setAlicePubHex] = useState<string>('');
  const [bobPubHex, setBobPubHex] = useState<string>('');
  const [aliceSecretHex, setAliceSecretHex] = useState<string>('');
  const [bobSecretHex, setBobSecretHex] = useState<string>('');
  const [isMatching, setIsMatching] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const [logs, setLogs] = useState<LogEntry[]>([
    { id: '1', timestamp: '00:00:01', source: 'ECDH-ENGINE', message: 'Initialized NIST P-256 (secp256r1) curve engine', type: 'info' }
  ]);

  const addLog = (message: string, type: 'info' | 'success' | 'warn' | 'error' = 'info') => {
    const entry: LogEntry = {
      id: Date.now().toString() + Math.random(),
      timestamp: new Date().toTimeString().split(' ')[0],
      source: 'ECDH-PROTOCOL',
      message,
      type
    };
    setLogs((prev) => [entry, ...prev.slice(0, 49)]);
  };

  const runEcdhExchange = async () => {
    setLoading(true);
    try {
      addLog('Generating ephemeral NIST P-256 keypair for Alice...', 'info');
      const alice = await generateEcdhKeypair();
      setAlicePubHex(alice.pubHex);

      addLog('Generating ephemeral NIST P-256 keypair for Bob...', 'info');
      const bob = await generateEcdhKeypair();
      setBobPubHex(bob.pubHex);

      addLog('Alice computing scalar multiplication: S = d_A · Q_B', 'info');
      const aliceDerived = await deriveEcdhSharedSecret(alice.keypair.privateKey, bob.keypair.publicKey);
      setAliceSecretHex(aliceDerived.rawBitsHex);

      addLog('Bob computing scalar multiplication: S = d_B · Q_A', 'info');
      const bobDerived = await deriveEcdhSharedSecret(bob.keypair.privateKey, alice.keypair.publicKey);
      setBobSecretHex(bobDerived.rawBitsHex);

      const match = aliceDerived.rawBitsHex === bobDerived.rawBitsHex;
      setIsMatching(match);

      if (match) {
        addLog('Shared curve point match confirmed: Alice and Bob computed identical 256-bit secret.', 'success');
      }
    } catch (err: any) {
      addLog(`ECDH Key Agreement failure: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runEcdhExchange();
  }, []);

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <div className="flex items-center space-x-2">
          <h1 className="font-mono text-base font-bold text-slate-100 uppercase tracking-tight">
            ECDH Key Exchange Workbench
          </h1>
          <Badge variant="prod">NIST P-256 (SECP256R1) &bull; WEB CRYPTO API</Badge>
        </div>
        <p className="font-mono text-xs text-slate-400 mt-0.5">
          Elliptic Curve Diffie-Hellman: Asymmetric key agreement via point scalar multiplication over prime field curves.
        </p>
      </div>

      {/* Control bar */}
      <Card
        title="PROTOCOL EXECUTION CONTROLS"
        action={
          <button
            onClick={runEcdhExchange}
            disabled={loading}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-sky-600 hover:bg-sky-500 text-white font-mono text-xs transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>GENERATE KEYPAIRS & RE-EXCHANGE</span>
          </button>
        }
      >
        <div className="font-mono text-xs text-slate-400">
          Curve: <span className="text-sky-300 font-semibold">NIST P-256 (secp256r1)</span> &bull; Security Level:{' '}
          <span className="text-emerald-400 font-semibold">128-bit (equivalent to 3072-bit RSA)</span>
        </div>
      </Card>

      {/* Public Point Exchange Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="ALICE LOCAL ENDPOINT">
          <div className="space-y-2">
            <div className="font-mono text-xs text-slate-400">Private Scalar d_A (256-bit integer): [Held in secure enclave]</div>
            <CodeBlock label="Alice Public Point Q_A (SEC1 Uncompressed - 65 bytes)" value={alicePubHex} />
          </div>
        </Card>

        <Card title="BOB LOCAL ENDPOINT">
          <div className="space-y-2">
            <div className="font-mono text-xs text-slate-400">Private Scalar d_B (256-bit integer): [Held in secure enclave]</div>
            <CodeBlock label="Bob Public Point Q_B (SEC1 Uncompressed - 65 bytes)" value={bobPubHex} />
          </div>
        </Card>
      </div>

      {/* Exchange Representation */}
      <Card title="ELLIPTIC CURVE POINT MULTIPLICATION RELATIONSHIP">
        <div className="p-3 bg-slate-950 font-mono text-xs text-slate-300 rounded border border-slate-800 space-y-1">
          <div>Alice computes: <span className="text-sky-400 font-bold">S = d_A · Q_B = d_A · (d_B · G) = (d_A · d_B) · G</span></div>
          <div>Bob computes:   <span className="text-sky-400 font-bold">S = d_B · Q_A = d_B · (d_A · G) = (d_A · d_B) · G</span></div>
        </div>
      </Card>

      {/* Derived Secret State */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="ALICE COMPUTED SHARED SECRET">
          <CodeBlock label="Raw 256-bit Curve Point (Hex)" value={aliceSecretHex} highlight />
        </Card>

        <Card title="BOB COMPUTED SHARED SECRET">
          <CodeBlock label="Raw 256-bit Curve Point (Hex)" value={bobSecretHex} highlight />
        </Card>
      </div>

      {isMatching && (
        <div className="p-2.5 bg-emerald-950/30 border border-emerald-800/80 rounded font-mono text-xs text-emerald-400 flex items-center justify-between">
          <span>✓ ECDH KEY AGREEMENT CONFIRMED: Alice and Bob reached the identical 256-bit shared coordinate.</span>
          <span className="text-[10px] uppercase font-bold text-emerald-500">STATUS: MATCH</span>
        </div>
      )}

      {/* Classical DH vs ECDH Comparative Analysis */}
      <Card title="TECHNICAL BENCHMARK: CLASSICAL DH (FFDH) VS ECDH">
        <div className="overflow-x-auto">
          <table className="w-full font-mono text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 uppercase text-[10px]">
                <th className="py-1.5 px-2">Metric</th>
                <th className="py-1.5 px-2">Classical DH (FFDH)</th>
                <th className="py-1.5 px-2">Elliptic Curve DH (ECDH)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300 text-[11px]">
              <tr>
                <td className="py-1.5 px-2 text-slate-400">128-bit Security Key Size</td>
                <td className="py-1.5 px-2">3072-bit modulus</td>
                <td className="py-1.5 px-2 text-emerald-400 font-bold">256-bit curve point</td>
              </tr>
              <tr>
                <td className="py-1.5 px-2 text-slate-400">Public Key Wire Overhead</td>
                <td className="py-1.5 px-2">384 bytes</td>
                <td className="py-1.5 px-2 text-emerald-400 font-bold">65 bytes (33 bytes compressed)</td>
              </tr>
              <tr>
                <td className="py-1.5 px-2 text-slate-400">Mathematical Group</td>
                <td className="py-1.5 px-2">Multiplicative group (ℤ_p*)</td>
                <td className="py-1.5 px-2">Weierstrass curve points E(𝔽_p)</td>
              </tr>
              <tr>
                <td className="py-1.5 px-2 text-slate-400">Hard Problem</td>
                <td className="py-1.5 px-2">Discrete Logarithm (DLP)</td>
                <td className="py-1.5 px-2 text-sky-400">ECDLP</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Event Stream */}
      <EventLog logs={logs} onClear={() => setLogs([])} />
    </div>
  );
};
