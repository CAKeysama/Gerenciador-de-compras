import React, { useEffect } from 'react';
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
  };

  const bgColors = {
    success: 'bg-white border-green-100',
    warning: 'bg-amber-50 border-amber-100',
    info: 'bg-blue-50 border-blue-100',
  };

  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border ${bgColors[type]} animate-in slide-in-from-bottom-5 fade-in duration-300`}>
      {icons[type]}
      <p className="text-sm font-medium text-slate-800">{message}</p>
      <button onClick={onClose} className="ml-2 text-slate-400 hover:text-slate-600">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};