import React, { ReactNode } from 'react';
import { HelpCircle } from 'lucide-react';

interface SmartTooltipProps {
  text: string;
  children: ReactNode;
  showIcon?: boolean;
}

export const SmartTooltip: React.FC<SmartTooltipProps> = ({ text, children, showIcon = false }) => {
  return (
    <div className="group relative flex items-center gap-1 w-full">
      {children}
      {showIcon && <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden w-max max-w-xs rounded bg-slate-800 px-3 py-1.5 text-xs text-white shadow-lg group-hover:block z-50 animate-in fade-in slide-in-from-bottom-1 duration-200">
        {text}
        {/* Triangle arrow */}
        <div className="absolute left-1/2 -translate-x-1/2 top-full h-0 w-0 border-x-4 border-t-4 border-x-transparent border-t-slate-800"></div>
      </div>
    </div>
  );
};