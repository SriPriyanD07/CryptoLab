import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { CodeBlock } from '../../components/ui/CodeBlock';
import { EventLog } from '../../components/terminal/EventLog';
import type { LogEntry } from '../../components/terminal/EventLog';
import {
  generateEcdsaKeypair,
  ecdsaSign,
  ecdsaVerify
} from '../../lib/crypto/webCrypto';
import { CheckCircle2, XCircle, RefreshCw, FileSignature } from 'lucide-react';

export const EcdsaWorkbench: React.FC = () => {
  const [originalMessage, setOriginalMessage] = useState<string>('Transfer ₹100 to Alice');
  const [evaluatedMessage, setEvaluatedMessage] = useState<string>('Transfer ₹100 to Alice');
  const [keypair, setKeypair] = useState<CryptoKeyPair | null>(null);
  const [publicKeyHex, setPublicKeyHex] = useState<string>('');
  const [signature, setSignature] = useState<{ sigHex: string; rHex: string; sHex: string } | null>(null);
  const [verificationResult, setVerificationResult] = useState<boolean | null>(null);

  const [logs, setLogs] = useState<LogEntry[]>([
    { id: '1', timestamp: '00:00:01', source: 'ECDSA-ENGINE', message: 'Initialized NIST P-256 (SHA-256) signature engine', type: 'info' }
  ]);

  const addLog = (message: string, type: 'info' | 'success' | 'warn' | 'error' = 'info') => {
    const entry: LogEntry = {
      id: Date.now().toString() + Math.random(),
      timestamp: new Date().toTimeString().split(' ')[0],
      source: 'ECDSA-PROTOCOL',
      message,
      type
    };
    setLogs((prev) => [entry, ...prev.slice(0, 49)]);
  };

  const handleGenerateKeypair = async () => {
    addLog('Generating new NIST P-256 signing keypair...', 'info');
    const kp = await generateEcdsaKeypair();
    setKeypair(kp.keypair);
    setPublicKeyHex(kp.pubHex);
    setSignature(null);
    setVerificationResult(null);
    addLog(`Derived public verification key: ${kp.pubHex.substring(0, 24)}...`, 'success');
  };

  const handleSign = async () => {
    if (!keypair) return;
    addLog(`Signing message digest with private key: "${originalMessage}"`, 'info');
    const sig = await ecdsaSign(keypair.privateKey, originalMessage);
    setSignature(sig);
    setEvaluatedMessage(originalMessage);
    setVerificationResult(true);
    addLog(`Signature generated (r: 32 bytes, s: 32 bytes)`, 'success');
  };

  const handleVerify = async () => {
    if (!keypair || !signature) return;
    addLog(`Evaluating signature verification for message: "${evaluatedMessage}"`, 'info');
    const isValid = await ecdsaVerify(keypair.publicKey, signature.sigHex, evaluatedMessage);
    setVerificationResult(isValid);

    if (isValid) {
      addLog('Signature verification SUCCESS: Message integrity and authenticity intact.', 'success');
    } else {
      addLog('Signature verification FAILED: Signature mismatch or message payload modified.', 'error');
    }
  };

  useEffect(() => {
    handleGenerateKeypair();
  }, []);

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <div className="flex items-center space-x-2">
          <h1 className="font-mono text-base font-bold text-slate-100 uppercase tracking-tight">
            ECDSA Digital Signatures Workbench
          </h1>
          <Badge variant="prod">ECDSA P-256 + SHA-256 &bull; WEB CRYPTO API</Badge>
        </div>
        <p className="font-mono text-xs text-slate-400 mt-0.5">
          Asymmetric message authentication, integrity verification, and non-repudiation over elliptic curves.
        </p>
      </div>

      {/* Conceptual Distinction Callout */}
      <div className="p-2.5 bg-slate-900 border border-slate-800 rounded font-mono text-xs text-slate-300 flex items-center justify-between">
        <div>
          <span className="text-sky-400 font-bold">ECDH</span>: Key Agreement (both sides establish a shared secret)
        </div>
        <div className="text-slate-600">|</div>
        <div>
          <span className="text-emerald-400 font-bold">ECDSA</span>: Digital Signatures (sender signs, receiver verifies)
        </div>
      </div>

      {/* Keypair Panel */}
      <Card
        title="SIGNING KEYPAIR"
        action={
          <button
            onClick={handleGenerateKeypair}
            className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span>NEW KEYPAIR</span>
          </button>
        }
      >
        <div className="font-mono text-xs space-y-2">
          <div className="text-slate-400 text-[11px]">Private Signing Key: [Protected in memory enclave]</div>
          <CodeBlock label="Public Verification Key (65 bytes hex)" value={publicKeyHex} />
        </div>
      </Card>

      {/* Signing Workspace */}
      <Card title="1. MESSAGE COMPOSITION & SIGNING">
        <div className="space-y-3 font-mono text-xs">
          <div>
            <label className="text-[11px] text-slate-400 uppercase font-semibold">Original Message to Sign</label>
            <div className="flex items-center space-x-2 mt-1">
              <input
                type="text"
                value={originalMessage}
                onChange={(e) => setOriginalMessage(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
              />
              <button
                onClick={handleSign}
                disabled={!keypair}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white font-mono text-xs font-semibold tracking-wider transition-colors"
              >
                <FileSignature className="w-3.5 h-3.5" />
                <span>SIGN MESSAGE</span>
              </button>
            </div>
          </div>

          {signature && (
            <div className="pt-2 border-t border-slate-800/80 space-y-2">
              <div className="text-[11px] text-slate-400 uppercase font-semibold">Generated Signature Components (64 bytes raw)</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <CodeBlock label="r component (32 bytes hex)" value={signature.rHex} />
                <CodeBlock label="s component (32 bytes hex)" value={signature.sHex} />
              </div>
              <CodeBlock label="Full Concatenated Signature (Hex)" value={signature.sigHex} />
            </div>
          )}
        </div>
      </Card>

      {/* Verification & Live Tampering */}
      {signature && (
        <Card title="2. VERIFICATION & LIVE PAYLOAD TAMPERING EXPERIMENT">
          <div className="space-y-3 font-mono text-xs">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] text-slate-400 uppercase font-semibold">Message Received at Verifier</label>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setEvaluatedMessage(originalMessage);
                      addLog('Reset message to original payload');
                    }}
                    className="text-[10px] text-slate-400 hover:text-slate-200 underline"
                  >
                    Reset to Original
                  </button>
                  <button
                    onClick={() => {
                      setEvaluatedMessage('Transfer ₹900 to Eve');
                      addLog('Simulated active attacker modifying payload to "Transfer ₹900 to Eve"', 'warn');
                    }}
                    className="text-[10px] text-amber-400 hover:text-amber-300 underline"
                  >
                    Simulate Tamper
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={evaluatedMessage}
                  onChange={(e) => setEvaluatedMessage(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
                />
                <button
                  onClick={handleVerify}
                  className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-semibold tracking-wider transition-colors border border-slate-700"
                >
                  VERIFY
                </button>
              </div>
            </div>

            {verificationResult !== null && (
              <div
                className={`p-3 rounded border font-mono text-xs flex items-center space-x-2.5 transition-all ${
                  verificationResult
                    ? 'bg-emerald-950/30 border-emerald-800/80 text-emerald-400'
                    : 'bg-rose-950/40 border-rose-800/80 text-rose-300'
                }`}
              >
                {verificationResult ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <div className="font-bold uppercase tracking-wider text-[11px]">SIGNATURE VALID</div>
                      <div className="text-[11px] text-emerald-400/80">
                        Cryptographic signature matches public key and message digest. Authentic origin confirmed.
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <div>
                      <div className="font-bold uppercase tracking-wider text-[11px]">SIGNATURE INVALID</div>
                      <div className="text-[11px] text-rose-300/80">
                        Signature verification rejected. Message was altered in transit or signed by a different key.
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Event Stream */}
      <EventLog logs={logs} onClear={() => setLogs([])} />
    </div>
  );
};
