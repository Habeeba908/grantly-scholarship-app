import { useEffect } from "react";

export interface ToastData { msg: string; undo?: () => void }

export function Toast({ toast, onClose }: { toast: ToastData | null; onClose: () => void }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, 6000);
    return () => clearTimeout(t);
  }, [toast, onClose]);
  return (
    <div className="toast-region" role="status" aria-live="polite">
      {toast && (
        <div className="toast">
          <span>{toast.msg}</span>
          {toast.undo && <button className="link-btn" onClick={() => { toast.undo?.(); onClose(); }}>Undo</button>}
          <button className="icon-btn small-btn" aria-label="Dismiss" onClick={onClose}>×</button>
        </div>
      )}
    </div>
  );
}
