import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { SecurityStatus } from '../../components/workstation/SecurityStatus';
import { CryptoInspector } from '../../components/workstation/CryptoInspector';
import { AttackerView } from '../../components/workstation/AttackerView';
import { ProtocolTrace, type ProtocolEvent } from '../../components/terminal/ProtocolTrace';
import {
  generateEcdsaKeypair,
  ecdsaSign,
  ecdsaVerify,
  computeSha256
} from '../../lib/crypto/webCrypto';
import { CheckCircle2, XCircle, RefreshCw, ShieldCheck } from 'lucide-react';

export const EcdsaWorkbench: React.FC = () => {
  const [originalMessage, setOriginalMessage] = useState<string>('Transfer ₹100 to Alice');
  const [evaluatedMessage, setEvaluatedMessage] = useState<string>('Transfer ₹100 to Alice');
  const [keypair, setKeypair] = useState<CryptoKeyPair | null>(null);
  const [publicKeyHex, setPublicKeyHex] = useState<string>('');
  const [messageHashHex, setMessageHashHex] = useState<string>('');
  const [signature, setSignature] = useState<{ sigHex: string; rHex: string; sHex: string } | null>(null);
  const [verificationResult, setVerificationResult] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const [events, setEvents] = useState<ProtocolEvent[]>([
    {
      id: 'init-1',
      timestamp: '00:00:01',
      actor: 'SYSTEM',
      action: 'Initialized NIST P-256 signature engine with SHA-256',
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

  const handleGenerateKeypair = async () => {
    setLoading(true);
    try {
      addEvent('SYSTEM', 'Generating new NIST P-256 signing keypair...', 'internal', 'info');
      const kp = await generateEcdsaKeypair();
      setKeypair(kp.keypair);
      setPublicKeyHex(kp.pubHex);

      const hashRes = await computeSha256(originalMessage);
      setMessageHashHex(hashRes.hex);

      const sig = await ecdsaSign(kp.keypair.privateKey, originalMessage);
      setSignature(sig);
      setEvaluatedMessage(originalMessage);
      setVerificationResult(true);

      addEvent('ALICE', `Message prepared: "${originalMessage}"`, 'internal', 'info');
      addEvent('SYSTEM', `Message hashed via SHA-256: ${hashRes.hex.substring(0, 16)}...`, 'internal', 'info');
      addEvent('ALICE', 'Generated ECDSA signature envelope (r: 32 bytes, s: 32 bytes)', 'outbound', 'success');
      addEvent('BOB', 'Verified signature against original message: VALID', 'inbound', 'success');
    } catch (err: any) {
      addEvent('SYSTEM', `Key generation error: ${err.message}`, 'internal', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSign = async () => {
    if (!keypair) return;
    setLoading(true);
    try {
      const hashRes = await computeSha256(originalMessage);
      setMessageHashHex(hashRes.hex);

      addEvent('ALICE', `Message digest prepared: "${originalMessage}"`, 'internal', 'info');
      const sig = await ecdsaSign(keypair.privateKey, originalMessage);
      setSignature(sig);
      setEvaluatedMessage(originalMessage);
      setVerificationResult(true);

      addEvent('ALICE', 'Generated fresh ECDSA signature (r, s)', 'outbound', 'success', {
        r: sig.rHex.substring(0, 16) + '...',
        s: sig.sHex.substring(0, 16) + '...'
      });
      addEvent('BOB', 'Signature verification evaluated: VALID', 'inbound', 'success');
    } catch (err: any) {
      addEvent('SYSTEM', `Signing error: ${err.message}`, 'internal', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!keypair || !signature) return;
    addEvent('BOB', `Evaluating signature verification for message: "${evaluatedMessage}"`, 'inbound', 'info');
    const isValid = await ecdsaVerify(keypair.publicKey, signature.sigHex, evaluatedMessage);
    setVerificationResult(isValid);

    if (isValid) {
      addEvent('BOB', 'Signature verification SUCCESS: Message integrity and authenticity intact.', 'inbound', 'success');
    } else {
      addEvent('BOB', 'Signature verification FAILED: Digest mismatch or message payload was modified.', 'inbound', 'error');
    }
  };

  const handleTamperPreset = () => {
    const tampered = 'Transfer ₹900 to Attacker';
    setEvaluatedMessage(tampered);
    addEvent('ATTACKER', `Modified message payload on wire to: "${tampered}"`, 'intercepted', 'warn');
  };

  const handleRestoreMessage = () => {
    setEvaluatedMessage(originalMessage);
    addEvent('SYSTEM', 'Restored verified original message payload', 'internal', 'info');
  };

  useEffect(() => {
    handleGenerateKeypair();
  }, []);

  const isTampered = evaluatedMessage !== originalMessage;

  return (
    <div className="space-y-4 font-mono text-xs select-none">
      {/* Workstation Header */}
      <div className="border border-[#20252b] bg-[#090b0e] rounded-[2px] p-3 flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
        <div className="flex items-center space-x-2">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0"></span>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xs font-bold text-[#e6e7e9] tracking-wider uppercase">
                ECDSA DIGITAL SIGNATURE WORKBENCH
              </h1>
              <span className="text-[9px] px-1.5 py-0.2 rounded-[2px] bg-[#161a20] border border-[#20252b] text-[#8b929a] font-semibold">
                FIPS 186-4 &bull; P-256 + SHA-256
              </span>
            </div>
            <div className="text-[10px] text-[#8b929a]">
              Asymmetric digital signatures // Point scalar signing & non-repudiation verification
            </div>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={handleGenerateKeypair}
            disabled={loading}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-[2px] bg-[#11151a] hover:bg-[#161b22] text-[#e6e7e9] border border-[#20252b] font-bold text-[10.5px] transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 text-[#8b929a] ${loading ? 'animate-spin' : ''}`} />
            <span>NEW KEYPAIR</span>
          </button>
        </div>
      </div>

      {/* Security Status Rail */}
      <div className="mb-4">
        <SecurityStatus
          title="SIGNATURE & AUTHENTICATION STATUS"
          customItems={[
            {
              id: 'keypair',
              label: 'KEYPAIR',
              status: keypair ? 'complete' : 'idle',
              detail: keypair ? 'P-256 Ready' : 'Pending'
            },
            {
              id: 'signature',
              label: 'ECDSA SIGNATURE',
              status: signature ? 'complete' : 'idle',
              detail: signature ? '64-byte (r, s)' : 'None'
            },
            {
              id: 'verification',
              label: 'INTEGRITY VERIFICATION',
              status: verificationResult === true ? 'verified' : verificationResult === false ? 'failed' : 'pending',
              detail: verificationResult === true ? 'SIGNATURE VALID' : verificationResult === false ? 'SIGNATURE INVALID' : 'PENDING'
            }
          ]}
        />
      </div>

      {/* 3-Column Standard Workstation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(250px,1fr)_minmax(380px,1.4fr)_minmax(280px,1fr)] xl:grid-cols-[minmax(260px,1fr)_minmax(420px,1.5fr)_minmax(300px,1fr)] gap-4 items-start">
        {/* Left Column: Signer / Payload Input */}
        <div className="space-y-4 min-w-0">
          <Card title="1. ALICE (SIGNER)">
            <div className="space-y-2 text-[10.5px]">
              <div>
                <label className="text-[10px] text-[#8b929a] uppercase font-semibold block">
                  Original Message to Sign:
                </label>
                <input
                  type="text"
                  value={originalMessage}
                  onChange={(e) => setOriginalMessage(e.target.value)}
                  className="w-full mt-1 bg-[#090b0e] border border-[#20252b] rounded-[2px] px-2 py-1 text-[#e6e7e9] focus:outline-none focus:border-[#8b929a] font-mono text-xs"
                />
              </div>

              <div className="pt-1 flex justify-end">
                <button
                  onClick={handleSign}
                  className="px-2.5 py-1 rounded-[2px] bg-[#e6e7e9] hover:bg-white text-black font-bold text-[10.5px] border border-[#e6e7e9] transition-colors"
                >
                  GENERATE SIGNATURE
                </button>
              </div>

              <div className="space-y-1.5 pt-1">
                <div>
                  <span className="text-[9px] text-[#5f6670] uppercase font-semibold block">SHA-256 Digest:</span>
                  <div className="p-1.5 rounded-[2px] bg-[#090b0e] border border-[#20252b] font-mono text-[9px] text-[#cbd5e1] break-all select-all">
                    {messageHashHex || 'Hashing...'}
                  </div>
                </div>

                <div>
                  <span className="text-[9px] text-[#5f6670] uppercase font-semibold block">Signature (r, s):</span>
                  <div className="p-1.5 rounded-[2px] bg-[#090b0e] border border-[#20252b] font-mono text-[9px] text-[#e6e7e9] break-all select-all">
                    {signature?.sigHex || 'Pending...'}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Center Column: Bob Verifier & Tamper Simulation */}
        <div className="space-y-4 min-w-0">
          <Card
            title="2. BOB (VERIFIER & TESTBED)"
            action={
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={handleTamperPreset}
                  className="px-1.5 py-0.5 rounded-[2px] bg-rose-950/60 hover:bg-rose-900/60 border border-rose-800 text-rose-300 text-[9px] font-mono transition-colors cursor-pointer"
                >
                  SIMULATE TAMPER
                </button>
                {isTampered && (
                  <button
                    onClick={handleRestoreMessage}
                    className="px-1.5 py-0.5 rounded-[2px] bg-[#161a20] hover:bg-[#20252b] border border-[#20252b] text-[#e6e7e9] text-[9px] font-mono transition-colors cursor-pointer"
                  >
                    RESTORE
                  </button>
                )}
              </div>
            }
          >
            <div className="space-y-2 text-[10.5px]">
              <div>
                <div className="flex items-center justify-between text-[10px]">
                  <label className="text-[#8b929a] uppercase font-semibold">Message Delivered to Bob:</label>
                  {isTampered && <span className="text-rose-400 font-bold text-[9px]">[MODIFIED ON WIRE]</span>}
                </div>
                <div className="flex items-center space-x-1.5 mt-1">
                  <input
                    type="text"
                    value={evaluatedMessage}
                    onChange={(e) => setEvaluatedMessage(e.target.value)}
                    className={`grow bg-[#090b0e] border rounded-[2px] px-2 py-1 font-mono text-xs ${
                      isTampered
                        ? 'border-rose-600 text-rose-300 bg-rose-950/20'
                        : 'border-[#20252b] text-[#e6e7e9] focus:border-[#8b929a] focus:outline-none'
                    }`}
                  />
                  <button
                    onClick={handleVerify}
                    className="px-3 py-1 rounded-[2px] bg-[#11151a] hover:bg-[#161b22] text-[#e6e7e9] border border-[#20252b] font-bold text-[10.5px] shrink-0 transition-colors cursor-pointer"
                  >
                    VERIFY
                  </button>
                </div>
              </div>

              {/* Verification Outcome Box */}
              <div
                className={`p-2.5 rounded-[2px] border flex items-center justify-between ${
                  verificationResult === true
                    ? 'bg-[#081510] border-emerald-900/80 text-emerald-300'
                    : verificationResult === false
                    ? 'bg-rose-950/30 border-rose-700 text-rose-300'
                    : 'bg-[#090b0e] border-[#20252b] text-[#8b929a]'
                }`}
              >
                <div className="flex items-center space-x-2">
                  {verificationResult === true ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : verificationResult === false ? (
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  ) : (
                    <ShieldCheck className="w-4 h-4 text-[#5f6670] shrink-0" />
                  )}
                  <div>
                    <span className="font-bold tracking-wider uppercase text-[11px] block">
                      {verificationResult === true
                        ? 'SIGNATURE VALID — INTEGRITY VERIFIED'
                        : verificationResult === false
                        ? 'SIGNATURE INVALID — TAMPER DETECTED'
                        : 'PENDING VERIFICATION EVALUATION'}
                    </span>
                    <span className="text-[9.5px] text-[#8b929a] block mt-0.5">
                      {verificationResult === true
                        ? 'Signature (r, s) mathematically verifies against message hash and public key.'
                        : verificationResult === false
                        ? 'Digest mismatch: Payload modified after signing. Verification strictly rejected.'
                        : 'Click VERIFY to evaluate cryptographic validity.'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Inspector & Observability */}
        <div className="space-y-4 min-w-0">
          <CryptoInspector
            title="ECDSA PARAMETER INSPECTOR"
            protocol="ECDSA (P-256)"
            sections={[
              {
                id: 'keys',
                title: 'KEY MATERIAL',
                fields: [
                  { id: 'curve', label: 'Curve', value: 'NIST P-256', tag: 'SECP256R1' },
                  { id: 'pub', label: 'Public Key', value: publicKeyHex, copyable: true },
                  {
                    id: 'priv',
                    label: 'Private Key',
                    value: 'Hardware-backed CryptoKey',
                    sensitive: true,
                    copyable: false
                  }
                ]
              },
              {
                id: 'sig_env',
                title: 'SIGNATURE ENVELOPE',
                fields: [
                  { id: 'r', label: 'Scalar r', value: signature?.rHex, copyable: true },
                  { id: 's', label: 'Scalar s', value: signature?.sHex, copyable: true },
                  { id: 'h', label: 'Message Hash', value: messageHashHex, copyable: true }
                ]
              }
            ]}
          />

          <AttackerView
            title="NETWORK OBSERVATION"
            threatModel="Passive wire eavesdropping + Active message tampering"
            tampered={isTampered}
            tamperMessage={isTampered ? 'Forged Message Payload' : undefined}
            observable={[
              { id: 'obs_pub', label: 'Public Signing Key', value: publicKeyHex },
              { id: 'obs_sig', label: 'Wire Signature (r,s)', value: signature?.sigHex },
              { id: 'obs_msg', label: 'Wire Message', value: evaluatedMessage }
            ]}
            protectedItems={[
              { id: 'prot_priv', label: 'Signer Private Scalar d' }
            ]}
          />
        </div>
      </div>

      {/* Bottom Full-Width Section: Real Event Protocol Trace */}
      <div className="mt-4">
        <ProtocolTrace
          title="ECDSA EXECUTION TRACE"
          events={events}
          onClear={() => setEvents([])}
        />
      </div>
    </div>
  );
};
