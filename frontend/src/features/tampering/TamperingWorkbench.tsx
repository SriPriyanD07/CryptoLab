import React, { useState, useEffect } from 'react';
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
import { RefreshCw, AlertOctagon, CheckCircle2 } from 'lucide-react';

export const TamperingWorkbench: React.FC = () => {
  const [plaintext, setPlaintext] = useState<string>('Authorize wire transfer of $1,000,000 to Account #7731');
  const [aad, setAad] = useState<string>('Routing: SWIFT-FEDWIRE | Clearance: Level-4');

  const [aesKey, setAesKey] = useState<CryptoKey | null>(null);
  const [nonce] = useState<Uint8Array>(generateNonce(12));
  const [originalPacket, setOriginalPacket] = useState<{
    ciphertextHex: string;
    tagHex: string;
  } | null>(null);

  // Attack Controls
  const [attackVector, setAttackVector] = useState<'bitflip' | 'header' | 'tag'>('bitflip');
  const [byteOffset, setByteOffset] = useState<number>(0);
  const [forgedHeader, setForgedHeader] = useState<string>('Routing: REDIRECT_TO_ATTACKER_ACCOUNT');

  // Mutated Packet State
  const [mutatedCiphertext, setMutatedCiphertext] = useState<string>('');
  const [mutatedTag, setMutatedTag] = useState<string>('');
  const [mutatedAad, setMutatedAad] = useState<string>('');

  const [receiverResult, setReceiverResult] = useState<{
    success: boolean;
    plaintext?: string;
    error?: string;
  } | null>(null);

  const [logs, setLogs] = useState<LogEntry[]>([
    { id: '1', timestamp: '00:00:01', source: 'ATTACK-LAB', message: 'Initialized active adversary wire interception laboratory', type: 'info' }
  ]);

  const addLog = (message: string, type: 'info' | 'success' | 'warn' | 'error' = 'info') => {
    const entry: LogEntry = {
      id: Date.now().toString() + Math.random(),
      timestamp: new Date().toTimeString().split(' ')[0],
      source: 'ADVERSARY-TOOL',
      message,
      type
    };
    setLogs((prev) => [entry, ...prev.slice(0, 49)]);
  };

  const initData = async () => {
    const { key } = await generateAesKey();
    setAesKey(key);

    const enc = await aesGcmEncrypt(plaintext, key, nonce, aad);
    setOriginalPacket({
      ciphertextHex: enc.ciphertextHex,
      tagHex: enc.tagHex
    });

    setMutatedCiphertext(enc.ciphertextHex);
    setMutatedTag(enc.tagHex);
    setMutatedAad(aad);
    setReceiverResult(null);
    addLog('Baseline authenticated packet generated and cached on wire.', 'info');
  };

  const applyAttack = () => {
    if (!originalPacket) return;

    if (attackVector === 'bitflip') {
      const chars = originalPacket.ciphertextHex.split('');
      const targetIdx = Math.min(byteOffset * 2, chars.length - 1);
      chars[targetIdx] = chars[targetIdx] === 'f' ? '0' : 'f';
      const modified = chars.join('');
      setMutatedCiphertext(modified);
      setMutatedTag(originalPacket.tagHex);
      setMutatedAad(aad);
      addLog(`Adversary bit-flip attack executed at hex nibble index ${targetIdx}`, 'warn');
    } else if (attackVector === 'header') {
      setMutatedCiphertext(originalPacket.ciphertextHex);
      setMutatedTag(originalPacket.tagHex);
      setMutatedAad(forgedHeader);
      addLog(`Adversary forged Associated Data header: "${forgedHeader}"`, 'warn');
    } else {
      const tagChars = originalPacket.tagHex.split('');
      tagChars[0] = tagChars[0] === 'a' ? 'b' : 'a';
      setMutatedCiphertext(originalPacket.ciphertextHex);
      setMutatedTag(tagChars.join(''));
      setMutatedAad(aad);
      addLog(`Adversary corrupted authentication tag bits`, 'warn');
    }
  };

  const evaluateReceiver = async () => {
    if (!aesKey || !originalPacket) return;
    addLog('Receiver evaluating packet integrity with local AES-GCM subkey...', 'info');
    const dec = await aesGcmDecrypt(
      mutatedCiphertext,
      mutatedTag,
      bufferToHex(nonce),
      aesKey,
      mutatedAad
    );
    setReceiverResult(dec);

    if (dec.success) {
      addLog(`Receiver: Authenticated successfully!`, 'success');
    } else {
      addLog(`Receiver: Tampering detected! Aborted with GHASH tag mismatch.`, 'error');
    }
  };

  useEffect(() => {
    initData();
  }, []);

  useEffect(() => {
    applyAttack();
  }, [attackVector, byteOffset, forgedHeader]);

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <div className="flex items-center space-x-2">
          <h1 className="font-mono text-base font-bold text-slate-100 uppercase tracking-tight">
            Active Tampering & MitM Attack Laboratory
          </h1>
          <Badge variant="warn">ACTIVE ADVERSARY SIMULATION</Badge>
        </div>
        <p className="font-mono text-xs text-slate-400 mt-0.5">
          Execute in-flight wire packet mutations: bit-flipping, header forging, and evaluate recipient GHASH MAC failure.
        </p>
      </div>

      {/* Baseline Wire Packet Generation */}
      <Card
        title="ORIGINAL TRANSMITTED PACKET (ALICE OUTPUT)"
        action={
          <button
            onClick={initData}
            className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span>GENERATE NEW BASELINE</span>
          </button>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
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
            <label className="text-[11px] text-slate-400 uppercase font-semibold">Associated Data (Cleartext Header)</label>
            <input
              type="text"
              value={aad}
              onChange={(e) => setAad(e.target.value)}
              className="w-full mt-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
            />
          </div>
        </div>

        {originalPacket && (
          <div className="mt-3 pt-2 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
            <CodeBlock label="Original Ciphertext (Hex)" value={originalPacket.ciphertextHex} />
            <CodeBlock label="Original Authentication Tag (Hex)" value={originalPacket.tagHex} />
          </div>
        )}
      </Card>

      {/* Adversary Mutation Studio */}
      <Card title="ADVERSARY WIRE MUTATION STUDIO (MAN-IN-THE-MIDDLE)">
        <div className="space-y-3 font-mono text-xs">
          <div>
            <label className="text-[11px] text-slate-400 uppercase font-semibold">Select Attack Vector</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-1">
              <button
                onClick={() => setAttackVector('bitflip')}
                className={`px-2.5 py-1.5 rounded border text-left transition-colors ${
                  attackVector === 'bitflip'
                    ? 'bg-rose-950/40 border-rose-600 text-rose-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                1. Ciphertext Bit-Flip Attack
              </button>
              <button
                onClick={() => setAttackVector('header')}
                className={`px-2.5 py-1.5 rounded border text-left transition-colors ${
                  attackVector === 'header'
                    ? 'bg-rose-950/40 border-rose-600 text-rose-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                2. Header (AAD) Modification
              </button>
              <button
                onClick={() => setAttackVector('tag')}
                className={`px-2.5 py-1.5 rounded border text-left transition-colors ${
                  attackVector === 'tag'
                    ? 'bg-rose-950/40 border-rose-600 text-rose-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                3. Authentication Tag Corruption
              </button>
            </div>
          </div>

          {attackVector === 'bitflip' && (
            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>Byte Offset to Invert (XOR 0xFF)</span>
                <span>Offset: {byteOffset}</span>
              </div>
              <input
                type="range"
                min="0"
                max={originalPacket ? Math.floor(originalPacket.ciphertextHex.length / 2) - 1 : 10}
                value={byteOffset}
                onChange={(e) => setByteOffset(Number(e.target.value))}
                className="w-full"
              />
            </div>
          )}

          {attackVector === 'header' && (
            <div>
              <label className="text-[11px] text-slate-400 uppercase font-semibold">Forged Header Value</label>
              <input
                type="text"
                value={forgedHeader}
                onChange={(e) => setForgedHeader(e.target.value)}
                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>
          )}

          {/* Wire Diff Table */}
          <div className="pt-2 border-t border-slate-800/80">
            <div className="text-[11px] text-slate-400 uppercase font-semibold mb-2">Wire Mutation State Comparison</div>
            <div className="space-y-1.5 bg-slate-950 p-2.5 rounded border border-slate-800 text-[11px]">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Ciphertext on Wire:</span>
                <span className={originalPacket?.ciphertextHex !== mutatedCiphertext ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                  {mutatedCiphertext.substring(0, 32)}...
                  {originalPacket?.ciphertextHex !== mutatedCiphertext && ' [MUTATED]'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Auth Tag on Wire:</span>
                <span className={originalPacket?.tagHex !== mutatedTag ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                  {mutatedTag}
                  {originalPacket?.tagHex !== mutatedTag && ' [MUTATED]'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Header on Wire:</span>
                <span className={aad !== mutatedAad ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                  {mutatedAad}
                  {aad !== mutatedAad && ' [MUTATED]'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={evaluateReceiver}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-semibold tracking-wider transition-colors border border-slate-700"
          >
            <span>DISPATCH MUTATED PACKET TO RECEIVER</span>
          </button>
        </div>
      </Card>

      {/* Receiver Verification Verdict */}
      {receiverResult && (
        <Card title="TARGET RECEIVER CRYPTOGRAPHIC VERDICT">
          <div
            className={`p-3.5 rounded border font-mono text-xs flex items-center space-x-3 ${
              receiverResult.success
                ? 'bg-emerald-950/30 border-emerald-800/80 text-emerald-400'
                : 'bg-rose-950/40 border-rose-800/80 text-rose-300'
            }`}
          >
            {receiverResult.success ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-bold uppercase tracking-wider text-[11px]">PACKET INTEGRITY CONFIRMED</div>
                  <div className="text-slate-200 mt-0.5 text-xs">
                    Decrypted Plaintext: <span className="text-white font-bold">{receiverResult.plaintext}</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0" />
                <div>
                  <div className="font-bold uppercase tracking-wider text-[11px]">CRYPTOGRAPHIC VERIFICATION FAILED</div>
                  <div className="text-rose-300/80 mt-0.5 text-xs">
                    AES-GCM GHASH evaluation failed. The receiver safely rejected the tampered packet and discarded all in-flight bytes.
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>
      )}

      {/* Event Stream */}
      <EventLog logs={logs} onClear={() => setLogs([])} />
    </div>
  );
};
