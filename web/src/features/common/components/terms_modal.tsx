import type { ReactNode } from "react";
import { X } from "lucide-react";

type TermsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

export const TermsModal = ({ isOpen, onClose, title, children }: TermsModalProps) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 pointer-events-auto" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(2px)' }} onClick={onClose}></div>
      <div className="fixed z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-800"
          >
            <X size={20} />
          </button>
          <h2 className="text-xl font-bold mb-4">{title}</h2>
          <div className="text-sm text-gray-700 max-h-[400px] overflow-y-auto space-y-2">
            {children}
          </div>
        </div>
      </div>
    </>
  );
};
