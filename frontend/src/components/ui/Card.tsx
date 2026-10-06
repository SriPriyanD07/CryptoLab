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
    <div className={`bg-[#0d1014] border border-[#20252b] rounded-[2px] p-3 text-[#cbd5e1] ${className}`}>
      {(title || badge || action) && (
        <div className="flex items-center justify-between border-b border-[#181d24] pb-2 mb-2.5">
          <div className="flex items-center space-x-2">
            {title && (
              <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#e6e7e9]">
                {title}
              </span>
            )}
            {badge}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
