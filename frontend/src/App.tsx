import { useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import type { ActiveModule } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';

// Workbenches
import { OverviewWorkbench } from './features/overview/OverviewWorkbench';
import { ModularWorkbench } from './features/modularArithmetic/ModularWorkbench';
import { RsaWorkbench } from './features/rsa/RsaWorkbench';
import { DhWorkbench } from './features/diffieHellman/DhWorkbench';
import { EcdhWorkbench } from './features/ecdh/EcdhWorkbench';
import { EcdsaWorkbench } from './features/ecdsa/EcdsaWorkbench';
import { Sha256Workbench } from './features/sha256/Sha256Workbench';
import { AesWorkbench } from './features/aesGcm/AesWorkbench';
import { SecureChannelWorkbench } from './features/secureChannel/SecureChannelWorkbench';
import { TamperingWorkbench } from './features/tampering/TamperingWorkbench';

export function App() {
  const [activeModule, setActiveModule] = useState<ActiveModule>('overview');
  const [resetCounter, setResetCounter] = useState<number>(0);

  const handleReset = () => {
    setResetCounter((prev) => prev + 1);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#050607] text-[#e6e7e9] font-sans">
      {/* Persistent Left Sidebar */}
      <Sidebar
        activeModule={activeModule}
        onSelectModule={(mod) => setActiveModule(mod)}
      />

      {/* Main Execution Surface */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Top Status Bar */}
        <TopBar
          activeModule={activeModule}
          onReset={handleReset}
        />

        {/* Scrollable Workbench Workspace */}
        <main className="flex-1 overflow-y-auto p-3 bg-[#050607]">
          <div key={`${activeModule}-${resetCounter}`} className="w-full max-w-[1560px] mx-auto pb-6">
            {activeModule === 'overview' && (
              <OverviewWorkbench onNavigate={(mod) => setActiveModule(mod)} />
            )}
            {activeModule === 'modular' && <ModularWorkbench />}
            {activeModule === 'rsa' && <RsaWorkbench />}
            {activeModule === 'dh' && <DhWorkbench />}
            {activeModule === 'ecdh' && <EcdhWorkbench />}
            {activeModule === 'ecdsa' && <EcdsaWorkbench />}
            {activeModule === 'sha256' && <Sha256Workbench />}
            {activeModule === 'aes' && <AesWorkbench />}
            {activeModule === 'secure-channel' && <SecureChannelWorkbench />}
            {activeModule === 'tampering' && <TamperingWorkbench />}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
