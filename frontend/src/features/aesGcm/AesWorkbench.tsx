import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { CodeBlock } from '../../components/ui/CodeBlock';
import { EventLog } from '../../components/terminal/EventLog';
import type { LogEntry } from '../../components/terminal/EventLog';
import {
  generateAesKey,
  generateNonce,
  aesGcmEncrypt,
  aesGcmDecrypt,
  bufferToHex
} from '../../lib/crypto/webCrypto';
import { RefreshCw, Lock, Unlock, AlertTriangle, ShieldCheck } from 'lucide-react';

export const AesWorkbench: React.FC = () => {
  const [plaintext, setPlaintext] = useState<string>('Hello Bob');
  const [aad, setAad] = useState<string>('Version: 1.0 | Channel: Secure');
  const [aesKey, setAesKey] = useState<CryptoKey | null>(null);
  const [keyHex, setKeyHex] = useState<string>('');
  const [nonce, setNonce] = useState<Uint8Array>(generateNonce(12));
  const [encryptedData, setEncryptedData] = useState<{
    ciphertextHex: string;
    tagHex: string;
    fullHex: string;
  } | null>(null);

  const [tamperedCiphertext, setTamperedCiphertext] = useState<string>('');
  const [decryptionResult, setDecryptionResult] = useState<{
    success: boolean;
    plaintext?: string;
    error?: string;
  } | null>(null);

  const [logs, setLogs] = useState<LogEntry[]>([
    { id: '1', timestamp: '00:00:01', source: 'AES-ENGINE', message: 'Initialized AES-256-GCM AEAD engine', type: 'info' }
  ]);

  const addLog = (message: string, type: 'info' | 'success' | 'warn' | 'error' = 'info') => {
    const entry: LogEntry = {
      id: Date.now().toString() + Math.random(),
      timestamp: new Date().toTimeString().split(' ')[0],
      source: 'AES-GCM',
      message,
      type
    };
    setLogs((prev) => [entry, ...prev.slice(0, 49)]);
  };

  const handleInitKey = async () => {
    addLog('Generating new 256-bit AES-GCM symmetric key...', 'info');
    const { key, rawHex } = await generateAesKey();
    setAesKey(key);
    setKeyHex(rawHex);
    setEncryptedData(null);
    setDecryptionResult(null);
    addLog('New 256-bit AES symmetric key loaded.', 'success');
  };

  const handleNewNonce = () => {
    const newN = generateNonce(12);
    setNonce(newN);
    addLog(`Generated fresh 96-bit (12-byte) random nonce: ${bufferToHex(newN)}`, 'info');
  };

  const handleEncrypt = async () => {
    if (!aesKey) return;
    addLog(`Encrypting plaintext payload (${plaintext.length} bytes) with AES-256-GCM...`, 'info');
    const enc = await aesGcmEncrypt(plaintext, aesKey, nonce, aad);
    setEncryptedData(enc);
    setTamperedCiphertext(enc.ciphertextHex);
    setDecryptionResult(null);
    addLog(`Encryption successful: generated ciphertext & 128-bit GHASH authentication tag.`, 'success');
  };

  const handleDecrypt = async () => {
    if (!aesKey || !encryptedData) return;
    addLog('Executing AES-GCM decryption & GHASH authentication tag verification...', 'info');
    const dec = await aesGcmDecrypt(
      tamperedCiphertext,
      encryptedData.tagHex,
      bufferToHex(nonce),
      aesKey,
      aad
    );
    setDecryptionResult(dec);
    if (dec.success) {
      addLog(`Decryption & authentication SUCCEEDED: "${dec.plaintext}"`, 'success');
    } else {
      addLog(`Decryption REJECTED: ${dec.error}`, 'error');
    }
  };

  const handleFlipBit = () => {
    if (!tamperedCiphertext) return;
    // Flip first character
    const firstChar = tamperedCiphertext[0];
    const flippedChar = firstChar === 'a' ? 'b' : 'a';
    const mutated = flippedChar + tamperedCiphertext.slice(1);
    setTamperedCiphertext(mutated);
    addLog('Simulated active adversary: Inverted bits in transmitted ciphertext', 'warn');
  };

  useEffect(() => {
    handleInitKey();
  }, []);

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <div className="flex items-center space-x-2">
          <h1 className="font-mono text-base font-bold text-slate-100 uppercase tracking-tight">
            AES-GCM Authenticated Encryption Workbench
          </h1>
          <Badge variant="prod">AES-256-GCM AEAD &bull; WEB CRYPTO API</Badge>
        </div>
        <p className="font-mono text-xs text-slate-400 mt-0.5">
          Authenticated Encryption with Associated Data (AEAD): Confidentiality (CTR mode) + Authenticity/Integrity (GHASH tag).
        </p>
      </div>

      {/* Key & Nonce Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card
          title="SYMMETRIC KEY (KEEP SECRET)"
          action={
            <button
              onClick={handleInitKey}
              className="flex items-center space-x-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>NEW KEY</span>
            </button>
          }
        >
          <CodeBlock label="256-Bit Secret Key (Hex)" value={keyHex} />
        </Card>

        <Card
          title="NONCE / IV (PUBLIC & UNIQUE)"
          action={
            <button
              onClick={handleNewNonce}
              className="flex items-center space-x-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>NEW NONCE</span>
            </button>
          }
        >
          <CodeBlock label="96-Bit Initialization Vector (12 bytes hex)" value={bufferToHex(nonce)} />
          <div className="font-mono text-[10px] text-amber-400/90 mt-1">
            CRITICAL: Nonce must never be reused with the same key.
          </div>
        </Card>
      </div>

      {/* Encryption Workspace */}
      <Card title="1. PLAINTEXT INPUT & AEAD ENCRYPTION">
        <div className="space-y-3 font-mono text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 uppercase font-semibold">Plaintext Payload</label>
              <input
                type="text"
                value={plaintext}
                onChange={(e) => setPlaintext(e.target.value)}
                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 uppercase font-semibold">Associated Data (AAD - Authenticated Header)</label>
              <input
                type="text"
                value={aad}
                onChange={(e) => setAad(e.target.value)}
                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>
          </div>

          <button
            onClick={handleEncrypt}
            disabled={!aesKey}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white font-mono text-xs font-semibold tracking-wider transition-colors"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>ENCRYPT WITH AES-256-GCM</span>
          </button>

          {encryptedData && (
            <div className="pt-2 border-t border-slate-800/80 space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <CodeBlock label="Ciphertext (Encrypted Payload)" value={encryptedData.ciphertextHex} />
                <CodeBlock label="Authentication Tag (16 bytes / 128-bit GHASH MAC)" value={encryptedData.tagHex} highlight />
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Decryption & Tampering Verification */}
      {encryptedData && (
        <Card title="2. DECRYPTION & ACTIVE TAMPERING EVALUATION">
          <div className="space-y-3 font-mono text-xs">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] text-slate-400 uppercase font-semibold">Ciphertext Arriving at Decryptor</label>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setTamperedCiphertext(encryptedData.ciphertextHex);
                      addLog('Reset ciphertext to authentic original state');
                    }}
                    className="text-[10px] text-slate-400 hover:text-slate-200 underline"
                  >
                    Reset Original
                  </button>
                  <button
                    onClick={handleFlipBit}
                    className="text-[10px] text-rose-400 hover:text-rose-300 underline font-semibold"
                  >
                    Modify Ciphertext (Bit-Flip Attack)
                  </button>
                </div>
              </div>

              <input
                type="text"
                value={tamperedCiphertext}
                onChange={(e) => setTamperedCiphertext(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-sky-500 font-mono text-xs"
              />
            </div>

            <button
              onClick={handleDecrypt}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-semibold tracking-wider transition-colors border border-slate-700"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>DECRYPT & VERIFY AUTHENTICATION TAG</span>
            </button>

            {decryptionResult && (
              <div
                className={`p-3 rounded border font-mono text-xs flex items-center space-x-2.5 ${
                  decryptionResult.success
                    ? 'bg-emerald-950/30 border-emerald-800/80 text-emerald-400'
                    : 'bg-rose-950/40 border-rose-800/80 text-rose-300'
                }`}
              >
                {decryptionResult.success ? (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <div className="font-bold uppercase tracking-wider text-[11px]">AUTHENTICATION VERIFIED</div>
                      <div className="text-[11px] text-emerald-400/80">
                        Plaintext: <span className="text-white font-bold">{decryptionResult.plaintext}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <div>
                      <div className="font-bold uppercase tracking-wider text-[11px]">AUTHENTICATION FAILED (INVALID TAG)</div>
                      <div className="text-[11px] text-rose-300/80">{decryptionResult.error}</div>
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
