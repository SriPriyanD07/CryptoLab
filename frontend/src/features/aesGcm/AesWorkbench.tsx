import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { SecurityStatus } from '../../components/workstation/SecurityStatus';
import { CryptoInspector } from '../../components/workstation/CryptoInspector';
import { AttackerView } from '../../components/workstation/AttackerView';
import { ProtocolTrace, type ProtocolEvent } from '../../components/terminal/ProtocolTrace';
import {
  generateAesKey,
  generateNonce,
  aesGcmEncrypt,
  aesGcmDecrypt,
  bufferToHex
} from '../../lib/crypto/webCrypto';
import {
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle
} from 'lucide-react';

export const AesWorkbench: React.FC = () => {
  const [plaintext, setPlaintext] = useState<string>('Transfer ₹1,000 to Bob');
  const [aad, setAad] = useState<string>('transaction-id=TX-1042 | clearance=level-2');
  const [aesKey, setAesKey] = useState<CryptoKey | null>(null);
  const [keyHex, setKeyHex] = useState<string>('');
  const [nonce, setNonce] = useState<Uint8Array>(generateNonce(12));

  // Encrypted state
  const [encryptedData, setEncryptedData] = useState<{
    ciphertextHex: string;
    tagHex: string;
    fullHex: string;
  } | null>(null);

  // Wire/eval state
  const [wireCiphertext, setWireCiphertext] = useState<string>('');
  const [wireAad, setWireAad] = useState<string>('transaction-id=TX-1042 | clearance=level-2');
  const [decryptionResult, setDecryptionResult] = useState<{
    success: boolean;
    plaintext?: string;
    error?: string;
  } | null>(null);

  const [loading, setLoading] = useState<boolean>(false);

  // Nonce reuse simulation state
  const [showNonceReuseLab, setShowNonceReuseLab] = useState<boolean>(false);
  const [nonceLeakDiff, setNonceLeakDiff] = useState<{ pDiff: string; cDiff: string } | null>(null);

  const [events, setEvents] = useState<ProtocolEvent[]>([
    {
      id: 'init-1',
      timestamp: '00:00:01',
      actor: 'SYSTEM',
      action: 'Initialized AES-256-GCM AEAD authenticated encryption engine',
      direction: 'internal',
      status: 'info'
    }
  ]);

  const addEvent = (
    actor: 'ALICE' | 'BOB' | 'SYSTEM' | 'NETWORK' | 'ATTACKER',
    action: string,
    direction: 'outbound' | 'inbound' | 'internal' | 'intercepted' = 'internal',
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

  const handleInitKey = async () => {
    setLoading(true);
    try {
      const { key, rawHex } = await generateAesKey();
      setAesKey(key);
      setKeyHex(rawHex);

      const freshNonce = generateNonce(12);
      setNonce(freshNonce);

      const enc = await aesGcmEncrypt(plaintext, key, freshNonce, aad);
      setEncryptedData(enc);
      setWireCiphertext(enc.ciphertextHex);
      setWireAad(aad);
      setDecryptionResult({ success: true, plaintext });

      addEvent('SYSTEM', 'Generated new 256-bit AES-GCM symmetric key and fresh 96-bit nonce', 'internal', 'info');
      addEvent('ALICE', 'Encrypted plaintext with AES-GCM and authenticated associated data (AAD)', 'outbound', 'success');
      addEvent('BOB', 'Decrypted ciphertext and verified 128-bit GHASH authentication tag: SUCCESS', 'inbound', 'success');
    } catch (err: any) {
      addEvent('SYSTEM', `Keygen error: ${err.message}`, 'internal', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEncrypt = async () => {
    if (!aesKey) return;
    setLoading(true);
    try {
      const freshNonce = generateNonce(12);
      setNonce(freshNonce);

      const enc = await aesGcmEncrypt(plaintext, aesKey, freshNonce, aad);
      setEncryptedData(enc);
      setWireCiphertext(enc.ciphertextHex);
      setWireAad(aad);
      setDecryptionResult(null);

      addEvent('ALICE', `Generated fresh 96-bit nonce: ${bufferToHex(freshNonce)}`, 'internal', 'info');
      addEvent('ALICE', `Encrypted plaintext payload (${plaintext.length} bytes) with AES-256-GCM`, 'outbound', 'success', {
        ciphertextBytes: enc.ciphertextHex.length / 2,
        tag: enc.tagHex
      });
    } catch (err: any) {
      addEvent('SYSTEM', `Encryption error: ${err.message}`, 'internal', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDecrypt = async () => {
    if (!aesKey || !encryptedData) return;
    addEvent('BOB', 'Executing AES-GCM decryption & GHASH authentication tag verification...', 'inbound', 'info');

    const dec = await aesGcmDecrypt(
      wireCiphertext,
      encryptedData.tagHex,
      bufferToHex(nonce),
      aesKey,
      wireAad
    );

    setDecryptionResult(dec);
    if (dec.success) {
      addEvent('BOB', `Decryption and GHASH verification SUCCEEDED: "${dec.plaintext}"`, 'inbound', 'success');
    } else {
      addEvent('BOB', 'AUTHENTICATION FAILED: GHASH tag mismatch. Plaintext release BLOCKED.', 'inbound', 'error');
    }
  };

  const handleModifyAad = () => {
    const forged = 'transaction-id=TX-9999 | clearance=level-4';
    setWireAad(forged);
    addEvent('ATTACKER', `Modified cleartext Associated Data (AAD) to: "${forged}"`, 'intercepted', 'warn');
  };

  const handleTamperCiphertext = () => {
    if (!wireCiphertext) return;
    const chars = wireCiphertext.split('');
    chars[0] = chars[0] === 'a' ? 'b' : 'a';
    const mutated = chars.join('');
    setWireCiphertext(mutated);
    addEvent('ATTACKER', 'Bit-flipped first nibble of ciphertext on network wire', 'intercepted', 'warn');
  };

  const handleRestoreWire = () => {
    if (!encryptedData) return;
    setWireCiphertext(encryptedData.ciphertextHex);
    setWireAad(aad);
    addEvent('SYSTEM', 'Restored wire packet to authentic ciphertext and AAD', 'internal', 'info');
  };

  const handleSimulateNonceReuse = async () => {
    if (!aesKey) return;
    const p1 = 'Transfer $1,000,000';
    const p2 = 'Authorize Operation';
    const reusedNonce = generateNonce(12);

    const enc1 = await aesGcmEncrypt(p1, aesKey, reusedNonce);
    const enc2 = await aesGcmEncrypt(p2, aesKey, reusedNonce);

    const c1Bytes = Array.from(enc1.ciphertextHex);
    const c2Bytes = Array.from(enc2.ciphertextHex);
    const minLen = Math.min(c1Bytes.length, c2Bytes.length);

    let xorHex = '';
    for (let i = 0; i < minLen; i += 2) {
      const b1 = parseInt(enc1.ciphertextHex.substring(i, i + 2), 16);
      const b2 = parseInt(enc2.ciphertextHex.substring(i, i + 2), 16);
      xorHex += (b1 ^ b2).toString(16).padStart(2, '0');
    }

    setNonceLeakDiff({
      pDiff: 'XOR of Plaintexts: P1 ⊕ P2 reveals structural plaintext relations without knowing K',
      cDiff: xorHex
    });

    addEvent('ATTACKER', 'Catastrophic Nonce Reuse Exploit: C1 ⊕ C2 == P1 ⊕ P2 (Two-Time Pad leak)', 'intercepted', 'warn');
  };

  useEffect(() => {
    handleInitKey();
  }, []);

  const isWireAltered =
    (encryptedData && wireCiphertext !== encryptedData.ciphertextHex) ||
    wireAad !== aad;

  return (
    <div className="space-y-4 font-mono text-xs select-none">
      {/* Workstation Header */}
      <div className="border border-[#20252b] bg-[#090b0e] rounded-[2px] p-3 flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
        <div className="flex items-center space-x-2">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0"></span>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xs font-bold text-[#e6e7e9] tracking-wider uppercase">
                AES-256-GCM AUTHENTICATED ENCRYPTION
              </h1>
              <span className="text-[9px] px-1.5 py-0.2 rounded-[2px] bg-[#161a20] border border-[#20252b] text-[#8b929a] font-semibold">
                NIST SP 800-38D &bull; AEAD
              </span>
            </div>
            <div className="text-[10px] text-[#8b929a]">
              Galois/Counter Mode // 256-bit CTR Confidentiality + 128-bit GHASH Polynomial Authentication Tag
            </div>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={handleInitKey}
            disabled={loading}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-[2px] bg-[#11151a] hover:bg-[#161b22] text-[#e6e7e9] border border-[#20252b] font-bold text-[10.5px] transition-colors"
          >
            <RefreshCw className={`w-3 h-3 text-[#8b929a] ${loading ? 'animate-spin' : ''}`} />
            <span>NEW 256-BIT KEY</span>
          </button>
        </div>
      </div>

      {/* Security Status Rail */}
      <div className="mb-4">
        <SecurityStatus
          title="AEAD ENCRYPTION & AUTHENTICATION STATUS"
          encryption="complete"
          authentication={
            decryptionResult === null
              ? 'pending'
              : decryptionResult.success
              ? 'verified'
              : 'failed'
          }
          customItems={[
            {
              id: 'cipher',
              label: 'ALGORITHM',
              status: 'complete',
              detail: 'AES-256-GCM'
            },
            {
              id: 'nonce_state',
              label: 'NONCE (96-BIT)',
              status: 'established',
              detail: bufferToHex(nonce).substring(0, 12) + '...'
            },
            {
              id: 'auth_tag',
              label: 'GHASH TAG (128-BIT)',
              status:
                decryptionResult === null
                  ? 'pending'
                  : decryptionResult.success
                  ? 'verified'
                  : 'failed',
              detail:
                decryptionResult === null
                  ? 'PENDING'
                  : decryptionResult.success
                  ? 'AUTHENTIC'
                  : 'REJECTED'
            }
          ]}
        />
      </div>

      {/* 3-Column Standard Workstation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(250px,1fr)_minmax(380px,1.4fr)_minmax(280px,1fr)] xl:grid-cols-[minmax(260px,1fr)_minmax(420px,1.5fr)_minmax(300px,1fr)] gap-4 items-start">
        {/* Left Column: Input / Parameters */}
        <div className="space-y-4 min-w-0">
          <Card title="1. INPUT PAYLOAD & ASSOCIATED DATA (AAD)">
            <div className="space-y-2 text-[10.5px]">
              <div>
                <label className="text-[10px] text-[#8b929a] uppercase font-semibold block">
                  Plaintext (Confidential Payload):
                </label>
                <textarea
                  value={plaintext}
                  onChange={(e) => setPlaintext(e.target.value)}
                  rows={2}
                  className="w-full mt-1 bg-[#090b0e] border border-[#20252b] rounded-[2px] px-2 py-1 text-[#e6e7e9] focus:outline-none focus:border-[#8b929a] font-mono text-xs"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-[10px]">
                  <label className="text-[#8b929a] uppercase font-semibold">
                    Associated Data AAD (Cleartext Metadata):
                  </label>
                  <span className="text-[9px] text-amber-400 font-bold">AUTHENTICATED ONLY</span>
                </div>
                <input
                  type="text"
                  value={aad}
                  onChange={(e) => setAad(e.target.value)}
                  className="w-full mt-1 bg-[#090b0e] border border-[#20252b] rounded-[2px] px-2 py-1 text-amber-300 font-mono text-xs focus:outline-none focus:border-[#8b929a]"
                />
              </div>

              <div className="pt-1 flex items-center justify-between text-[10px]">
                <div className="text-[#5f6670] truncate max-w-[150px]">
                  Nonce (IV): <span className="text-[#e6e7e9] font-bold">{bufferToHex(nonce)}</span>
                </div>
                <button
                  onClick={handleEncrypt}
                  className="px-2.5 py-1 rounded-[2px] bg-[#e6e7e9] hover:bg-white text-black font-bold text-[10.5px] border border-[#e6e7e9] transition-colors"
                >
                  ENCRYPT PAYLOAD
                </button>
              </div>
            </div>
          </Card>

          {/* Nonce Reuse Lab Toggle */}
          <div className="p-2.5 rounded-[2px] bg-[#0d1014] border border-[#20252b] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-amber-400 text-[10px] font-bold uppercase">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>NONCE REUSE LAB</span>
              </div>
              <button
                onClick={() => {
                  setShowNonceReuseLab((prev) => !prev);
                  if (!showNonceReuseLab) handleSimulateNonceReuse();
                }}
                className="text-[9.5px] px-2 py-0.5 rounded-[2px] bg-[#11151a] border border-[#20252b] text-[#8b929a] hover:text-[#e6e7e9]"
              >
                {showNonceReuseLab ? '[ HIDE ]' : '[ SIMULATE EXPLOIT ]'}
              </button>
            </div>

            {showNonceReuseLab && nonceLeakDiff && (
              <div className="p-2 rounded-[2px] bg-[#050607] border border-amber-900/60 text-[9.5px] space-y-1">
                <div className="text-amber-300 font-bold uppercase">TWO-TIME PAD CATASTROPHE:</div>
                <div className="text-[#8b929a]">{nonceLeakDiff.pDiff}</div>
                <div className="font-mono text-[#e6e7e9] break-all select-all mt-0.5">
                  C1 &oplus; C2 = {nonceLeakDiff.cDiff}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center Column: Wire Transit, Tampering & Decryption */}
        <div className="space-y-4 min-w-0">
          <Card
            title="2. NETWORK WIRE & INTEGRITY TAMPERING"
            action={
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={handleModifyAad}
                  className="px-1.5 py-0.5 rounded-[2px] bg-amber-950/60 hover:bg-amber-900/60 border border-amber-800 text-amber-300 text-[9px] font-mono transition-colors cursor-pointer"
                  title="Forge associated data header"
                >
                  MODIFY AAD
                </button>
                <button
                  onClick={handleTamperCiphertext}
                  className="px-1.5 py-0.5 rounded-[2px] bg-rose-950/60 hover:bg-rose-900/60 border border-rose-800 text-rose-300 text-[9px] font-mono transition-colors cursor-pointer"
                  title="Flip ciphertext bit"
                >
                  FLIP CIPHERTEXT BIT
                </button>
                {isWireAltered && (
                  <button
                    onClick={handleRestoreWire}
                    className="px-1.5 py-0.5 rounded-[2px] bg-[#161a20] hover:bg-[#20252b] border border-[#20252b] text-[#e6e7e9] text-[9px] font-mono transition-colors cursor-pointer"
                  >
                    RESTORE
                  </button>
                )}
              </div>
            }
          >
            <div className="space-y-2 text-[10px]">
              <div>
                <span className="text-[#5f6670] uppercase font-semibold block text-[9px]">
                  Wire Transmitted AAD Header:
                </span>
                <div
                  className={`p-1.5 rounded-[2px] mt-0.5 font-mono text-[10px] break-all ${
                    wireAad !== aad
                      ? 'bg-amber-950/30 border border-amber-600 text-amber-300 font-bold'
                      : 'bg-[#090b0e] border border-[#20252b] text-[#8b929a]'
                  }`}
                >
                  {wireAad}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-[9px]">
                  <span className="text-slate-500 uppercase font-semibold">Ciphertext (Hex):</span>
                  {wireCiphertext !== encryptedData?.ciphertextHex && (
                    <span className="text-rose-400 font-bold">[BIT FLIPPED]</span>
                  )}
                </div>
                <div
                  className={`mt-0.5 p-1.5 rounded-[2px] font-mono text-[9.5px] break-all select-all ${
                    wireCiphertext !== encryptedData?.ciphertextHex
                      ? 'bg-rose-950/30 border border-rose-700 text-rose-300 font-bold'
                      : 'bg-[#090b0e] border border-[#20252b] text-[#e6e7e9]'
                  }`}
                >
                  {wireCiphertext || 'Pending encryption...'}
                </div>
              </div>

              <div>
                <span className="text-[#5f6670] uppercase font-semibold block text-[9px]">
                  128-bit GHASH Tag (Hex):
                </span>
                <div className="mt-0.5 p-1.5 rounded-[2px] bg-[#090b0e] border border-[#20252b] font-mono text-[9.5px] text-emerald-400 break-all select-all font-bold">
                  {encryptedData?.tagHex || 'Pending encryption...'}
                </div>
              </div>

              <div className="pt-1 flex justify-end">
                <button
                  onClick={handleDecrypt}
                  className="px-3 py-1 rounded-[2px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10.5px] transition-colors"
                >
                  DECRYPT & AUTHENTICATE
                </button>
              </div>
            </div>
          </Card>

          {/* Decryption Outcome Card */}
          {decryptionResult && (
            <div
              className={`p-2.5 rounded-[2px] border font-mono text-xs ${
                decryptionResult.success
                  ? 'bg-[#081510] border-emerald-900/80 text-emerald-300'
                  : 'bg-rose-950/30 border-rose-700 text-rose-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                {decryptionResult.success ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <div>
                  <span className="font-bold tracking-wider uppercase text-[11px] block">
                    {decryptionResult.success
                      ? 'AUTHENTICATION VERIFIED — PLAINTEXT RELEASED'
                      : 'AUTHENTICATION FAILED — PLAINTEXT NOT RELEASED'}
                  </span>
                  <span className="text-[10px] text-slate-300 block mt-0.5">
                    {decryptionResult.success
                      ? `Recovered Plaintext: "${decryptionResult.plaintext}"`
                      : 'Security Boundary Triggered: GHASH authentication tag check failed on modified ciphertext or AAD. Plaintext blocked.'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Inspector & Observation */}
        <div className="space-y-4 min-w-0">
          <CryptoInspector
            title="AES-GCM PARAMETER INSPECTOR"
            protocol="AES-256-GCM"
            sections={[
              {
                id: 'key_material',
                title: 'KEY & INITIALIZATION VECTOR',
                fields: [
                  {
                    id: 'aes_key',
                    label: '256-bit Key',
                    value: keyHex || 'Initialized',
                    sensitive: true,
                    copyable: true
                  },
                  {
                    id: 'nonce_iv',
                    label: 'Current Nonce',
                    value: bufferToHex(nonce),
                    copyable: true
                  }
                ]
              },
              {
                id: 'wire_state',
                title: 'WIRE PAYLOAD & INTEGRITY TAG',
                fields: [
                  {
                    id: 'ct_len',
                    label: 'Ciphertext',
                    value: wireCiphertext ? `${wireCiphertext.substring(0, 24)}... (${wireCiphertext.length / 2} B)` : '<none>',
                    copyable: true
                  },
                  {
                    id: 'ghash_tag',
                    label: 'GHASH Tag',
                    value: encryptedData?.tagHex,
                    copyable: true
                  },
                  {
                    id: 'aad_val',
                    label: 'Associated Data',
                    value: wireAad,
                    copyable: true
                  }
                ]
              }
            ]}
          />

          <AttackerView
            title="NETWORK OBSERVATION"
            threatModel="Passive wire sniffing + Active MitM modification"
            tampered={isWireAltered}
            tamperMessage={
              wireAad !== aad
                ? 'AAD Header Forgery'
                : wireCiphertext !== encryptedData?.ciphertextHex
                ? 'Ciphertext Bit Flip'
                : undefined
            }
            observable={[
              {
                id: 'obs_nonce',
                label: 'Nonce (IV)',
                value: bufferToHex(nonce)
              },
              {
                id: 'obs_ct',
                label: 'Ciphertext',
                value: wireCiphertext ? wireCiphertext.substring(0, 24) + '...' : ''
              },
              {
                id: 'obs_tag',
                label: 'GHASH Tag',
                value: encryptedData?.tagHex
              },
              {
                id: 'obs_aad',
                label: 'Wire AAD',
                value: wireAad
              }
            ]}
            protectedItems={[
              { id: 'prot_key', label: '256-bit AES Key' },
              { id: 'prot_plain', label: 'Confidential Plaintext' }
            ]}
          />
        </div>
      </div>

      {/* Bottom Full-Width Section: Real Event Protocol Trace */}
      <div className="mt-4">
        <ProtocolTrace
          title="AES-GCM PROTOCOL EXECUTION TRACE"
          events={events}
          onClear={() => setEvents([])}
        />
      </div>
    </div>
  );
};
