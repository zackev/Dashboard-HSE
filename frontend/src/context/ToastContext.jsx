import React, { createContext, useCallback, useContext, useRef, useState } from 'react';

const ToastCtx = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null); // { message, isError }
  const timerRef = useRef(null);

  const showToast = useCallback((message, isError = false) => {
    setToast({ message, isError });
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setToast(null), 2800);
  }, []);

  return (
    <ToastCtx.Provider value={showToast}>
      {children}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-[100] max-w-xs rounded-lg border px-4 py-3 text-[13px] font-semibold shadow-modal ${
            toast.isError
              ? 'border-border border-l-4 border-l-bad bg-surface2 text-ink'
              : 'border-border border-l-4 border-l-good bg-surface2 text-ink'
          }`}
        >
          {toast.message}
        </div>
      )}
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToast harus dipakai di dalam <ToastProvider>');
  return ctx;
}
