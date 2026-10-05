import React from 'react';

interface CardProps {
  title?: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, badge, children, className = '', action }) => {
  return (
    <div className={`bg-slate-900/70 border border-slate-800 rounded-sm p-4 relative ${className}`}>
      {(title || badge || action) && (
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5 mb-3.5">
          <div className="flex items-center space-x-2.5">
            {title && <span className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-300">{title}</span>}
            {badge}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
