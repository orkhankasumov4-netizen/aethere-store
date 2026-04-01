import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useUI } from '../stores/useUI';

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useUI();

  return (
    <div 
      className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none"
      aria-live="polite"
      aria-atomic="true"
      role="status"
    >
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = icons[toast.type];
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.95 }}
              role="alert"
              className="pointer-events-auto flex items-center gap-3 bg-[#141414] border border-gray-800 rounded-2xl px-5 py-4 shadow-2xl max-w-sm"
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${
                toast.type === 'success' ? 'text-emerald-400' :
                toast.type === 'error' ? 'text-rose-400' :
                toast.type === 'warning' ? 'text-amber-400' : 'text-blue-400'
              }`} aria-hidden="true" />
              <div className="flex-1 text-sm text-white">{toast.message}</div>
              {toast.action && (
                <button onClick={toast.action} className="text-[#7C3AED] text-sm font-medium hover:underline">Undo</button>
              )}
              <button 
                onClick={() => removeToast(toast.id)} 
                className="text-gray-500 hover:text-white"
                aria-label="Dismiss notification"
              >
                <X size={16} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
