import { Link } from 'wouter';
import apretonManos from '@assets/images/apreton-de-manos.gif';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  routeType: string   
  type: string;   
  projectId: string | null;
};

export const SuccessModal = ({ isOpen, onClose, message, routeType, type, projectId }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full text-center">
        
        <img
          src={apretonManos}
          alt="Apreton de manos"
          className="w-16 h-16 mx-auto mb-4"
        />
        <p className="mb-4 text-gray-700">{message}</p>
        <Link href={`/${routeType}/${projectId}`}>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-md hover:opacity-90"
          >
            <p className=" text-white">Ver {type}</p>
          </button>
        </Link>
      </div>
    </div>
  );
};
