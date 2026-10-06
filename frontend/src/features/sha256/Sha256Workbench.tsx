import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { SecurityStatus } from '../../components/workstation/SecurityStatus';
import { CryptoInspector } from '../../components/workstation/CryptoInspector';
import { AttackerView } from '../../components/workstation/AttackerView';
import { ProtocolTrace, type ProtocolEvent } from '../../components/terminal/ProtocolTrace';
import { computeAvalanche } from '../../lib/crypto/webCrypto';
import { Binary } from 'lucide-react';

export const Sha256Workbench: React.FC = () => {
  const [inputA, setInputA] = useState<string>('hello');
  const [inputB, setInputB] = useState<string>('hellp');
  const [avalancheData, setAvalancheData] = useState<{
    hashA: string;
    hashB: string;
    binaryA: string;
    binaryB: string;
    differingBits: number;
    percentage: number;
  } | null>(null);

  const [events, setEvents] = useState<ProtocolEvent[]>([
    {
      id: 'init-1',
      timestamp: '00:00:01',
      actor: 'SYSTEM',
      action: 'Initialized FIPS 180-4 SHA-256 cryptographic digest engine',
      direction: 'internal',
      status: 'info'
    }
  ]);

  const addEvent = (
    actor: 'SYSTEM',
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

  const handleCompute = async (textA: string, textB: string) => {
    const res = await computeAvalanche(textA, textB);
    setAvalancheData(res);

    addEvent('SYSTEM', `Computed SHA-256 digests for "${textA}" and "${textB}"`, 'internal', 'info');
    addEvent('SYSTEM', `Avalanche analysis: ${res.differingBits} / 256 bits flipped (${res.percentage}%)`, 'internal', 'success', {
      differingBits: res.differingBits,
      percentage: `${res.percentage}%`
    });
  };

  useEffect(() => {
    handleCompute(inputA, inputB);
  }, [inputA, inputB]);

  const setPreset = (a: string, b: string) => {
    setInputA(a);
    setInputB(b);
  };

  return (
    <div className="space-y-4 font-mono text-xs select-none">
      {/* Workstation Header */}
      <div className="border border-[#20252b] bg-[#090b0e] rounded-[2px] p-3 flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
        <div className="flex items-center space-x-2">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0"></span>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xs font-bold text-[#e6e7e9] tracking-wider uppercase">
                SHA-256 CRYPTOGRAPHIC HASH & AVALANCHE WORKBENCH
              </h1>
              <span className="text-[9px] px-1.5 py-0.2 rounded-[2px] bg-[#161a20] border border-[#20252b] text-[#8b929a] font-semibold">
                FIPS 180-4 &bull; WEB CRYPTO API
              </span>
            </div>
            <div className="text-[10px] text-[#8b929a]">
              One-way compression & strict avalanche criterion // 256-bit fixed output diffusion analysis
            </div>
          </div>
        </div>

        {/* Presets Bar */}
        <div className="flex items-center space-x-1.5 shrink-0 text-[10px]">
          <span className="text-[#5f6670] uppercase text-[9px]">PRESETS:</span>
          <button
            onClick={() => setPreset('hello', 'hellp')}
            className="px-2 py-0.5 rounded-[2px] bg-[#11151a] hover:bg-[#161b22] border border-[#20252b] text-[#8b929a] hover:text-[#e6e7e9] font-semibold cursor-pointer"
          >
            hello / hellp
          </button>
          <button
            onClick={() => setPreset('password', 'Password')}
            className="px-2 py-0.5 rounded-[2px] bg-[#11151a] hover:bg-[#161b22] border border-[#20252b] text-[#8b929a] hover:text-[#e6e7e9] font-semibold cursor-pointer"
          >
            Case Flip
          </button>
          <button
            onClick={() => setPreset('message', 'message.')}
            className="px-2 py-0.5 rounded-[2px] bg-[#11151a] hover:bg-[#161b22] border border-[#20252b] text-[#8b929a] hover:text-[#e6e7e9] font-semibold cursor-pointer"
          >
            Period Added
          </button>
        </div>
      </div>

      {/* Security Status Rail */}
      <div className="mb-4">
        <SecurityStatus
          title="HASH FUNCTION & DIFFUSION STATUS"
          customItems={[
            {
              id: 'hash_a',
              label: 'DIGEST A',
              status: avalancheData ? 'complete' : 'active',
              detail: '256 bits'
            },
            {
              id: 'hash_b',
              label: 'DIGEST B',
              status: avalancheData ? 'complete' : 'active',
              detail: '256 bits'
            },
            {
              id: 'avalanche',
              label: 'AVALANCHE CRITERION (&asymp;50%)',
              status: avalancheData && Math.abs(avalancheData.percentage - 50) < 15 ? 'verified' : 'active',
              detail: avalancheData ? `${avalancheData.percentage}% flipped` : 'Pending'
            }
          ]}
        />
      </div>

      {/* 3-Column Standard Workstation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(250px,1fr)_minmax(380px,1.4fr)_minmax(280px,1fr)] xl:grid-cols-[minmax(260px,1fr)_minmax(420px,1.5fr)_minmax(300px,1fr)] gap-4 items-start">
        {/* Left Column: Input Payloads & Digests */}
        <div className="space-y-4 min-w-0">
          <Card title="INPUT PAYLOAD A">
            <div className="space-y-2 text-[10.5px]">
              <div>
                <label className="text-[10px] text-[#8b929a] uppercase font-semibold block">Message String A:</label>
                <input
                  type="text"
                  value={inputA}
                  onChange={(e) => setInputA(e.target.value)}
                  className="w-full mt-1 bg-[#090b0e] border border-[#20252b] rounded-[2px] px-2 py-1 text-[#e6e7e9] focus:outline-none focus:border-[#8b929a] font-mono text-xs"
                />
              </div>

              {avalancheData && (
                <div className="p-1.5 rounded-[2px] bg-[#090b0e] border border-[#20252b]">
                  <span className="text-[9px] text-[#5f6670] uppercase font-semibold block">SHA-256 Digest A:</span>
                  <span className="font-mono text-[9.5px] text-[#e6e7e9] break-all select-all block mt-0.5">
                    {avalancheData.hashA}
                  </span>
                </div>
              )}
            </div>
          </Card>

          <Card title="INPUT PAYLOAD B (MODIFIED)">
            <div className="space-y-2 text-[10.5px]">
              <div>
                <label className="text-[10px] text-[#8b929a] uppercase font-semibold block">Message String B:</label>
                <input
                  type="text"
                  value={inputB}
                  onChange={(e) => setInputB(e.target.value)}
                  className="w-full mt-1 bg-[#090b0e] border border-[#20252b] rounded-[2px] px-2 py-1 text-[#e6e7e9] focus:outline-none focus:border-[#8b929a] font-mono text-xs"
                />
              </div>

              {avalancheData && (
                <div className="p-1.5 rounded-[2px] bg-[#090b0e] border border-[#20252b]">
                  <span className="text-[9px] text-[#5f6670] uppercase font-semibold block">SHA-256 Digest B:</span>
                  <span className="font-mono text-[9.5px] text-amber-400 break-all select-all block mt-0.5">
                    {avalancheData.hashB}
                  </span>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Center Column: Avalanche Metrics & 256-Bit Diff Grid */}
        <div className="space-y-4 min-w-0">
          {avalancheData && (
            <Card title="AVALANCHE EFFECT DIFFUSION METRICS">
              <div className="space-y-3 font-mono text-xs">
                {/* Metric Statistics */}
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="p-2 bg-[#090b0e] border border-[#20252b] rounded-[2px]">
                    <div className="text-[9px] text-[#5f6670] uppercase font-semibold">Hamming Distance:</div>
                    <div className="text-lg font-bold text-[#e6e7e9] mt-0.5">
                      {avalancheData.differingBits} <span className="text-[9px] text-[#5f6670] font-normal">/ 256 bits</span>
                    </div>
                  </div>

                  <div className="p-2 bg-[#090b0e] border border-[#20252b] rounded-[2px]">
                    <div className="text-[9px] text-[#5f6670] uppercase font-semibold">Bit Flip %:</div>
                    <div className="text-lg font-bold text-emerald-400 mt-0.5">
                      {avalancheData.percentage}%
                    </div>
                  </div>
                </div>

                {/* 256-Bit Difference Grid */}
                <div className="p-2 rounded-[2px] bg-[#090b0e] border border-[#20252b] space-y-1.5">
                  <div className="flex items-center justify-between text-[9px]">
                    <div className="flex items-center space-x-1 text-[#e6e7e9] font-bold uppercase">
                      <Binary className="w-3 h-3 text-[#8b929a]" />
                      <span>256-Bit Stream Diff Map</span>
                    </div>
                    <div className="flex items-center space-x-2 text-[8.5px]">
                      <span className="flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 bg-rose-500 inline-block" />
                        <span className="text-rose-300">Flipped</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 bg-[#20252b] inline-block" />
                        <span className="text-[#8b929a]">Same</span>
                      </span>
                    </div>
                  </div>

                  <div className="p-1.5 rounded-[2px] bg-[#090b0e] border border-[#20252b]">
                    <div className="grid grid-cols-16 sm:grid-cols-32 gap-0.5 justify-items-center">
                      {Array.from({ length: 256 }).map((_, idx) => {
                        const bitA = avalancheData.binaryA[idx] || '0';
                        const bitB = avalancheData.binaryB[idx] || '0';
                        const isDiff = bitA !== bitB;

                        return (
                          <div
                            key={idx}
                            title={`Bit #${idx}: ${isDiff ? 'FLIPPED' : 'IDENTICAL'}`}
                            className={`w-2 h-2 rounded-[1px] transition-colors ${
                              isDiff ? 'bg-rose-500' : 'bg-[#20252b]'
                            }`}
                          />
                        );
                      })}
                    </div>
                  </div>

                  <div className="text-[9px] text-[#8b929a] leading-tight">
                    Strict Avalanche Criterion (SAC): Changing a single input bit inverts approximately 50% of digest bits uniformly.
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Right Column: Inspector & Observability */}
        <div className="space-y-4 min-w-0">
          <CryptoInspector
            title="SHA-256 PARAMETER INSPECTOR"
            protocol="FIPS 180-4"
            sections={[
              {
                id: 'digest_props',
                title: 'DIGEST PARAMETERS',
                fields: [
                  { id: 'algo', label: 'Algorithm', value: 'SHA-256', tag: 'MERKLE-DAMGÅRD' },
                  { id: 'digest_size', label: 'Digest Size', value: '256 bits (32 B)' },
                  { id: 'block_size', label: 'Block Size', value: '512 bits (64 B)' }
                ]
              },
              {
                id: 'evaluation',
                title: 'CURRENT METRICS',
                fields: [
                  { id: 'diff', label: 'Hamming Dist', value: avalancheData ? `${avalancheData.differingBits} / 256 (${avalancheData.percentage}%)` : '—' }
                ]
              }
            ]}
          />

          <AttackerView
            title="NETWORK OBSERVATION"
            threatModel="Passive observer with full plaintext input and digest visibility"
            observable={[
              { id: 'obs_hash_a', label: 'Hash Digest A', value: avalancheData?.hashA },
              { id: 'obs_hash_b', label: 'Hash Digest B', value: avalancheData?.hashB }
            ]}
            protectedItems={[]}
          />
        </div>
      </div>

      {/* Bottom Full-Width Section: Real Event Protocol Trace */}
      <div className="mt-4">
        <ProtocolTrace
          title="SHA-256 EXECUTION TRACE"
          events={events}
          onClear={() => setEvents([])}
        />
      </div>
    </div>
  );
};
