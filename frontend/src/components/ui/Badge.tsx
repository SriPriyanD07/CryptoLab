import React from 'react';

interface BadgeProps {
  variant: 'edu' | 'prod' | 'info' | 'fail' | 'warn';
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ variant, children }) => {
  const styles = {
    edu: 'bg-amber-950/30 text-amber-400 border-amber-800/50',
    prod: 'bg-emerald-950/30 text-emerald-400 border-emerald-800/50',
    info: 'bg-[#161a20] text-[#e6e7e9] border-[#20252b]',
    fail: 'bg-rose-950/30 text-rose-400 border-rose-800/50',
    warn: 'bg-amber-950/30 text-amber-400 border-amber-800/50'
  };

  return (
    <span className={`inline-flex items-center font-mono text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-[2px] border ${styles[variant]}`}>
      {children}
    </span>
  );
};
