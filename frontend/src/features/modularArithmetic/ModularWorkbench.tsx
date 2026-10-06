import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { EventLog } from '../../components/terminal/EventLog';
import type { LogEntry } from '../../components/terminal/EventLog';
import {
  mod,
  modPow,
  euclideanGcd,
  extendedGcd,
  modInverse,
  getModPowSteps
} from '../../lib/crypto/modMath';

export const ModularWorkbench: React.FC = () => {
  const [a, setA] = useState<string>('17');
  const [b, setB] = useState<string>('28');
  const [n, setN] = useState<string>('12');
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: '1', timestamp: '00:00:01', source: 'MATH-ENGINE', message: 'Initialized BigInt finite group arithmetic', type: 'info' }
  ]);

  const addLog = (message: string, type: 'info' | 'success' | 'warn' | 'error' = 'info') => {
    const entry: LogEntry = {
      id: Date.now().toString() + Math.random(),
      timestamp: new Date().toTimeString().split(' ')[0],
      source: 'MOD-ENGINE',
      message,
      type
    };
    setLogs((prev) => [entry, ...prev.slice(0, 49)]);
  };

  // Safe parsing to BigInt
  let bigA = 17n, bigB = 28n, bigN = 12n;
  let parseError = false;
  try {
    bigA = BigInt(a);
    bigB = BigInt(b);
    bigN = BigInt(n);
    if (bigN <= 0n) parseError = true;
  } catch {
    parseError = true;
  }

  // Computations
  const resAMod = !parseError ? mod(bigA, bigN).toString() : 'ERR';
  const resBMod = !parseError ? mod(bigB, bigN).toString() : 'ERR';
  const resAdd = !parseError ? mod(bigA + bigB, bigN).toString() : 'ERR';
  const resSub = !parseError ? mod(bigA - bigB, bigN).toString() : 'ERR';
  const resMul = !parseError ? mod(bigA * bigB, bigN).toString() : 'ERR';
  const resPow = !parseError && bigB >= 0n ? modPow(bigA, bigB, bigN).toString() : 'N/A';

  const gcdData = !parseError ? euclideanGcd(bigA, bigB) : null;
  const extData = !parseError ? extendedGcd(bigA, bigB) : null;
  const invData = !parseError ? modInverse(bigA, bigN) : null;
  const powSteps = !parseError && bigB >= 0n ? getModPowSteps(bigA, bigB, bigN) : null;

  return (
    <div className="space-y-4">
      {/* Workbench Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#20252b] gap-2 mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="font-mono text-sm font-semibold tracking-wider text-[#e6e7e9] uppercase">
              MODULAR ARITHMETIC WORKBENCH
            </h1>
            <Badge variant="info">RING THEORY ℤ_n</Badge>
          </div>
          <p className="font-mono text-[11px] text-[#8b929a] mt-0.5">
            Finite group residue arithmetic, Euclidean GCD, Bézout identity coefficients, and modular multiplicative inverse.
          </p>
        </div>
      </div>

      {/* Main 3-Column Standard Workstation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(250px,1fr)_minmax(380px,1.4fr)_minmax(280px,1fr)] xl:grid-cols-[minmax(260px,1fr)_minmax(420px,1.5fr)_minmax(300px,1fr)] gap-4 items-start">
        {/* Column 1: Input Parameters */}
        <div className="space-y-4 min-w-0">
          <Card title="INPUT PARAMETERS">
            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-[10px] text-[#8b929a] uppercase font-medium">Integer a</label>
                <input
                  type="text"
                  value={a}
                  onChange={(e) => {
                    setA(e.target.value);
                    addLog(`Updated integer a = ${e.target.value}`);
                  }}
                  className="w-full mt-1 bg-[#090b0e] border border-[#20252b] rounded-[2px] px-2 py-1 text-[#e6e7e9] focus:outline-none focus:border-[#8b929a] font-mono text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#8b929a] uppercase font-medium">Integer b</label>
                <input
                  type="text"
                  value={b}
                  onChange={(e) => {
                    setB(e.target.value);
                    addLog(`Updated integer b = ${e.target.value}`);
                  }}
                  className="w-full mt-1 bg-[#090b0e] border border-[#20252b] rounded-[2px] px-2 py-1 text-[#e6e7e9] focus:outline-none focus:border-[#8b929a] font-mono text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#8b929a] uppercase font-medium">Modulus n (n &gt; 0)</label>
                <input
                  type="text"
                  value={n}
                  onChange={(e) => {
                    setN(e.target.value);
                    addLog(`Updated modulus n = ${e.target.value}`);
                  }}
                  className="w-full mt-1 bg-[#090b0e] border border-[#20252b] rounded-[2px] px-2 py-1 text-[#e6e7e9] focus:outline-none focus:border-[#8b929a] font-mono text-xs"
                />
              </div>
            </div>
          </Card>

          <Card title="ALGEBRAIC CONTEXT">
            <div className="font-mono text-[11px] text-[#8b929a] space-y-2">
              <div className="p-2 bg-[#090b0e] border border-[#20252b] rounded-[2px]">
                <div className="text-[10px] text-[#5f6670] uppercase">Residue Class</div>
                <div className="text-[#e6e7e9] mt-0.5">ℤ/{n}ℤ ring elements: [0 .. {Number(n) > 0 ? Number(n)-1 : 'n-1'}]</div>
              </div>
              <div className="p-2 bg-[#090b0e] border border-[#20252b] rounded-[2px]">
                <div className="text-[10px] text-[#5f6670] uppercase">Coprimality Condition</div>
                <div className="text-[#e6e7e9] mt-0.5">
                  a⁻¹ exists in ℤ_{n} ⟺ gcd({a}, {n}) = 1
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Column 2: Residue Operations & GCD */}
        <div className="space-y-4 min-w-0">
          <Card title="BASIC RESIDUE OPERATIONS (MOD n)">
            <div className="font-mono text-xs space-y-1.5">
              <div className="flex justify-between items-center p-1.5 bg-[#090b0e] border border-[#20252b] rounded-[2px]">
                <span className="text-[#8b929a] text-[11px]">a mod n</span>
                <span className="text-[#e6e7e9] font-bold">{resAMod}</span>
              </div>
              <div className="flex justify-between items-center p-1.5 bg-[#090b0e] border border-[#20252b] rounded-[2px]">
                <span className="text-[#8b929a] text-[11px]">b mod n</span>
                <span className="text-[#e6e7e9] font-bold">{resBMod}</span>
              </div>
              <div className="flex justify-between items-center p-1.5 bg-[#090b0e] border border-[#20252b] rounded-[2px]">
                <span className="text-[#8b929a] text-[11px]">(a + b) mod n</span>
                <span className="text-emerald-400 font-bold">{resAdd}</span>
              </div>
              <div className="flex justify-between items-center p-1.5 bg-[#090b0e] border border-[#20252b] rounded-[2px]">
                <span className="text-[#8b929a] text-[11px]">(a - b) mod n</span>
                <span className="text-emerald-400 font-bold">{resSub}</span>
              </div>
              <div className="flex justify-between items-center p-1.5 bg-[#090b0e] border border-[#20252b] rounded-[2px]">
                <span className="text-[#8b929a] text-[11px]">(a * b) mod n</span>
                <span className="text-emerald-400 font-bold">{resMul}</span>
              </div>
              <div className="flex justify-between items-center p-1.5 bg-[#090b0e] border border-[#20252b] rounded-[2px]">
                <span className="text-[#8b929a] text-[11px]">a^b mod n</span>
                <span className="text-amber-400 font-bold">{resPow}</span>
              </div>
            </div>
          </Card>

          <Card title="GREATEST COMMON DIVISOR & MODULAR INVERSE">
            <div className="font-mono text-xs space-y-2">
              <div>
                <div className="text-[10px] text-[#8b929a] uppercase font-medium mb-1">Euclidean GCD(a, b)</div>
                <div className="p-1.5 bg-[#090b0e] border border-[#20252b] rounded-[2px] flex justify-between items-center">
                  <span className="text-[#8b929a] text-[11px]">gcd({a}, {b})</span>
                  <span className="font-bold text-[#e6e7e9]">{gcdData ? gcdData.gcd.toString() : 'ERR'}</span>
                </div>
              </div>

              {extData && (
                <div>
                  <div className="text-[10px] text-[#8b929a] uppercase font-medium mb-1">Bézout's Identity: a·x + b·y = gcd</div>
                  <div className="p-1.5 bg-[#090b0e] border border-[#20252b] rounded-[2px] text-[#8b929a] text-[11px]">
                    {a}·({extData.x.toString()}) + {b}·({extData.y.toString()}) = {extData.gcd.toString()}
                  </div>
                </div>
              )}

              <div>
                <div className="text-[10px] text-[#8b929a] uppercase font-medium mb-1">Modular Inverse: a⁻¹ mod n</div>
                {invData?.exists ? (
                  <div className="p-1.5 bg-emerald-950/20 border border-emerald-800/50 rounded-[2px] text-emerald-300 text-[11px]">
                    Inverse exists: <span className="font-bold">{invData.inverse?.toString()}</span>
                    <div className="text-[10px] text-emerald-400/80 mt-0.5">
                      ({a} * {invData.inverse?.toString()}) mod {n} = 1
                    </div>
                  </div>
                ) : (
                  <div className="p-1.5 bg-rose-950/20 border border-rose-800/50 rounded-[2px] text-rose-300 text-[11px]">
                    Inverse does NOT exist: gcd({a}, {n}) = {invData?.gcd.toString()} ≠ 1
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Column 3: Square-and-Multiply Binary Trace */}
        <div className="space-y-4 min-w-0">
          {powSteps ? (
            <Card title={`SQUARE-AND-MULTIPLY (${a}^${b} mod ${n})`}>
              <div className="font-mono text-xs text-[#8b929a] mb-2">
                Exponent binary: <span className="text-[#e6e7e9] font-bold">{powSteps.binaryExp}</span> ({powSteps.binaryExp.length} bits)
              </div>
              <div className="overflow-x-auto max-h-80">
                <table className="w-full font-mono text-[10px] text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#20252b] text-[#5f6670] uppercase">
                      <th className="py-1 px-1.5">Bit</th>
                      <th className="py-1 px-1.5">Val</th>
                      <th className="py-1 px-1.5">Pre</th>
                      <th className="py-1 px-1.5">Op</th>
                      <th className="py-1 px-1.5">Post</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#20252b] text-[#8b929a]">
                    {powSteps.steps.map((s) => (
                      <tr key={s.step} className="hover:bg-[#161a20]/40">
                        <td className="py-1 px-1.5 text-[#5f6670]">#{s.step}</td>
                        <td className="py-1 px-1.5 text-[#e6e7e9] font-bold">{s.bit}</td>
                        <td className="py-1 px-1.5">{s.result_before}</td>
                        <td className="py-1 px-1.5 text-[#5f6670]">
                          {s.bit === '1' ? 'Sq&Mul' : 'Sq'}
                        </td>
                        <td className="py-1 px-1.5 text-emerald-400 font-bold">{s.result_after}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : (
            <Card title="EXPONENTIATION TRACE">
              <div className="font-mono text-xs text-[#8b929a] p-3 text-center">
                Enter valid non-negative integer b and modulus n &gt; 0 to compute square-and-multiply steps.
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Bottom Event Log */}
      <div className="mt-4">
        <EventLog logs={logs} onClear={() => setLogs([])} />
      </div>
    </div>
  );
};
