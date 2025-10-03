import { LucideX } from 'lucide-react';

export function Modal({ open, onClose, children }: { open: boolean, onClose: () => void, children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center"
      onClick={onClose}
      style={{ pointerEvents: 'auto', zIndex: 696969 }}
    >
      <div
        className="bg-white p-6 rounded shadow-lg relative mx-4"
        style={{ maxWidth: 800, width: '100%', pointerEvents: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        <button className="absolute top-4 right-4 cursor-pointer" onClick={onClose}>
          <LucideX size={32} strokeWidth={1} />
        </button>
        {children}
      </div>
    </div>
  );
}
