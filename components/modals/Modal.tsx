import { useEffect } from 'react';
import type { ReactNode } from 'react';

interface Props {
  onClose:  () => void;
  children: ReactNode;
  wide?:    boolean;
}

export default function Modal({ onClose, children, wide = false }: Props) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className={`
          bg-surface border border-border rounded-2xl shadow-2xl
          w-full flex flex-col max-h-[90vh]
          ${wide ? 'max-w-3xl' : 'max-w-md'}
        `}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export function ModalHeader({ title, accent }: { title: string; accent?: string }) {
  return (
    <div className="px-5 pt-5 pb-3 border-b border-border">
      <h2 className={`text-base font-semibold ${accent ?? 'text-accent'}`}>{title}</h2>
    </div>
  );
}

export function ModalBody({ children }: { children: ReactNode }) {
  return <div className="px-5 py-4 flex-1 overflow-y-auto">{children}</div>;
}

export function ModalFooter({ children }: { children: ReactNode }) {
  return (
    <div className="px-5 pb-5 pt-2 flex flex-wrap gap-2 border-t border-border">
      {children}
    </div>
  );
}

export function ModalBtn({
  onClick, primary = false, danger = false, children, disabled = false,
}: {
  onClick: () => void; primary?: boolean; danger?: boolean;
  children: ReactNode; disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        text-xs font-mono font-semibold px-3 py-1.5 rounded-lg border transition-all
        disabled:opacity-50 disabled:cursor-not-allowed
        ${primary && !danger ? 'bg-accent/10 border-accent/40 text-accent hover:bg-accent/20' : ''}
        ${danger             ? 'bg-havoc/10 border-havoc/40 text-havoc hover:bg-havoc/20'   : ''}
        ${!primary && !danger ? 'border-border text-subtext hover:text-text hover:border-subtext' : ''}
      `}
    >
      {children}
    </button>
  );
}
