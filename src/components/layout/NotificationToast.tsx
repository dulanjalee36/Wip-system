/**
 * UNIMAK WIP STOCK MANAGEMENT SYSTEM
 * Notification Toast
 */

import React from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const NotificationToast: React.FC = () => {
  const { notification, clearNotification } = useApp();

  if (!notification) return null;

  const isSuccess = notification.type === 'success';
  const isError = notification.type === 'error';

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md animate-in slide-in-from-bottom-5 duration-200">
      <div
        className={`flex items-start p-4 rounded-xl shadow-xl border backdrop-blur-md ${
          isSuccess
            ? 'bg-emerald-950/90 border-emerald-800 text-emerald-100'
            : isError
            ? 'bg-rose-950/90 border-rose-800 text-rose-100'
            : 'bg-slate-900/95 border-slate-700 text-slate-100'
        }`}
      >
        <div className="shrink-0 mr-3 mt-0.5">
          {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          {isError && <AlertTriangle className="w-5 h-5 text-rose-400" />}
          {!isSuccess && !isError && <Info className="w-5 h-5 text-blue-400" />}
        </div>
        <div className="flex-1 mr-2 text-sm leading-relaxed font-medium">
          {notification.message}
        </div>
        <button
          onClick={clearNotification}
          className="text-slate-400 hover:text-white transition-colors p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
