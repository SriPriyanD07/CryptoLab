import React from 'react';

interface BadgeProps {
  variant: 'edu' | 'prod' | 'info' | 'fail' | 'warn';
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ variant, children }) => {
  const styles = {
    edu: 'bg-amber-950/40 text-amber-400 border-amber-800/60',
    prod: 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60',
    info: 'bg-sky-950/40 text-sky-400 border-sky-800/60',
    fail: 'bg-rose-950/40 text-rose-400 border-rose-800/60',
    warn: 'bg-orange-950/40 text-orange-400 border-orange-800/60'
  };

  return (
    <span className={`inline-flex items-center font-mono text-[11px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded border ${styles[variant]}`}>
      {children}
    </span>
  );
};
