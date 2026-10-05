import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { CodeBlock } from '../../components/ui/CodeBlock';
import { EventLog } from '../../components/terminal/EventLog';
import type { LogEntry } from '../../components/terminal/EventLog';
import { computeAvalanche } from '../../lib/crypto/webCrypto';

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

  const [logs, setLogs] = useState<LogEntry[]>([
    { id: '1', timestamp: '00:00:01', source: 'SHA256-ENGINE', message: 'Initialized FIPS 180-4 SHA-256 digest engine', type: 'info' }
  ]);

  const addLog = (message: string, type: 'info' | 'success' | 'warn' | 'error' = 'info') => {
    const entry: LogEntry = {
      id: Date.now().toString() + Math.random(),
      timestamp: new Date().toTimeString().split(' ')[0],
      source: 'SHA256-ENGINE',
      message,
      type
    };
    setLogs((prev) => [entry, ...prev.slice(0, 49)]);
  };

  const handleCompute = async () => {
    const res = await computeAvalanche(inputA, inputB);
    setAvalancheData(res);
    addLog(`Evaluated avalanche effect: ${res.differingBits} / 256 bits flipped (${res.percentage}%)`, 'info');
  };

  useEffect(() => {
    handleCompute();
  }, [inputA, inputB]);

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <div className="flex items-center space-x-2">
          <h1 className="font-mono text-base font-bold text-slate-100 uppercase tracking-tight">
            SHA-256 Workbench
          </h1>
          <Badge variant="prod">FIPS 180-4 SHA-256 &bull; WEB CRYPTO API</Badge>
        </div>
        <p className="font-mono text-xs text-slate-400 mt-0.5">
          Fixed 256-bit cryptographic digest generation and Avalanche Effect Hamming distance analysis.
        </p>
      </div>

      {/* Input Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
        <Card title="INPUT PAYLOAD A">
          <input
            type="text"
            value={inputA}
            onChange={(e) => setInputA(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
            placeholder="Type input A..."
          />
          {avalancheData && (
            <div className="mt-3">
              <CodeBlock label="Digest A (Hex - 256 bits / 64 chars)" value={avalancheData.hashA} />
            </div>
          )}
        </Card>

        <Card title="INPUT PAYLOAD B (1-CHAR MODIFIED)">
          <input
            type="text"
            value={inputB}
            onChange={(e) => setInputB(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
            placeholder="Type input B..."
          />
          {avalancheData && (
            <div className="mt-3">
              <CodeBlock label="Digest B (Hex - 256 bits / 64 chars)" value={avalancheData.hashB} />
            </div>
          )}
        </Card>
      </div>

      {/* Avalanche Effect Metrics */}
      {avalancheData && (
        <Card title="AVALANCHE EFFECT ANALYSIS (HAMMING DISTANCE)">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs mb-3">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded">
              <div className="text-[11px] text-slate-400 uppercase">Changed Bits</div>
              <div className="text-2xl font-bold text-sky-400 mt-1">
                {avalancheData.differingBits} <span className="text-xs text-slate-500 font-normal">/ 256</span>
              </div>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded">
              <div className="text-[11px] text-slate-400 uppercase">Bit Flip Ratio</div>
              <div className="text-2xl font-bold text-emerald-400 mt-1">
                {avalancheData.percentage}%
              </div>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded">
              <div className="text-[11px] text-slate-400 uppercase">Statistical Ideal</div>
              <div className="text-2xl font-bold text-slate-300 mt-1">
                ~50.0% <span className="text-xs text-slate-500 font-normal">(Pseudo-random)</span>
              </div>
            </div>
          </div>

          {/* 256-bit visual grid */}
          <div>
            <div className="text-[11px] font-mono text-slate-400 uppercase font-semibold mb-2">
              256-Bit Stream Diff Map (Green = Matching bit, Red = Flipped bit)
            </div>
            <div className="grid grid-cols-32 gap-1 p-2 bg-slate-950 border border-slate-800 rounded overflow-x-auto">
              {Array.from({ length: 256 }).map((_, idx) => {
                const bitA = avalancheData.binaryA[idx] || '0';
                const bitB = avalancheData.binaryB[idx] || '0';
                const isFlipped = bitA !== bitB;
                return (
                  <div
                    key={idx}
                    title={`Bit ${idx}: A=${bitA}, B=${bitB}`}
                    className={`h-3 w-2.5 rounded-[1px] transition-colors ${
                      isFlipped ? 'bg-rose-500/80' : 'bg-emerald-500/30'
                    }`}
                  />
                );
              })}
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-1.5 px-1">
              <span>Bit 0 (MSB)</span>
              <span>Bit 255 (LSB)</span>
            </div>
          </div>
        </Card>
      )}

      {/* Event Stream */}
      <EventLog logs={logs} onClear={() => setLogs([])} />
    </div>
  );
};
