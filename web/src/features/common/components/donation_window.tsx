import { useState } from 'react';
import yapeQR from '@assets/images/yape_qr.jpg';
import donationIcon from '@assets/images/donation_icon.png';
import { useLocation } from 'wouter';

const DO_NOT_SHOW_LOCATIONS = ['/signup', '/login', '/confirmar-correo', '/completar-registro', '/perfil'];

export function DonationWindow() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'yape' | 'plin'>('yape');
  const [showDialog, setShowDialog] = useState(true);

  const [location,] = useLocation();

  console.log({ location });

  if (DO_NOT_SHOW_LOCATIONS.includes(location)) {
    return <></>;
  }

  return (
    <>
      {/* Small dialog above the button */}
      {showDialog && (
        <div
          className="fixed z-50 bg-white border border-gray-300 shadow-lg px-4 py-2 rounded-xl flex items-center gap-2 animate-fade-in"
          style={{
            left: 28,
            bottom: 96, // 64px button height + 24px gap (1.5rem)
            minWidth: 120,
            maxWidth: 220
          }}
        >
          <span className="text-[0.95rem]">Apóyanos</span>
          <button
            onClick={() => setShowDialog(false)}
            className="ml-1 text-gray-400 hover:text-gray-700 focus:outline-none"
            aria-label="Cerrar aviso"
          >
            ×
          </button>
        </div>
      )}
      <button
        className="fixed cursor-pointer bottom-6 opacity-85 left-6 z-50 bg-primary/90 hover:bg-primary rounded-full shadow-xl flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary"
        style={{ width: 64, height: 64 }}
        onClick={() => setOpen((v) => !v)}
        aria-label="Donar"
        aria-pressed={open}
      >
        <img src={donationIcon} alt="Donar" className="w-[48px] h-[48px]" />
      </button>
      {open && (
        <div className="fixed bottom-26 left-4 z-50 bg-white border border-gray-300 shadow-xl p-4 rounded-xl w-[320px] max-w-[90vw] animate-fade-in flex flex-col items-center">
          <div className="flex w-full mb-2">
            <button
              className={`flex-1 py-2 font-bold rounded-l-lg transition-colors ${tab === 'yape' ? 'text-white' : 'text-black'}`}
              style={tab === 'yape' ? { background: '#8d1a9e' } : { background: '#f3f3f3' }}
              onClick={() => setTab('yape')}
            >
              Yape
            </button>
            <button
              className={`flex-1 py-2 font-bold rounded-r-lg transition-colors ${tab === 'plin' ? 'text-white' : 'text-black'}`}
              style={tab === 'plin' ? { background: '#08bedf' } : { background: '#f3f3f3' }}
              onClick={() => setTab('plin')}
            >
              Plin
            </button>
          </div>
          <div className="w-full flex justify-center items-center min-h-[220px]">
            {tab === 'yape' ? (
              <div style={{ background: '#8d1a9e' }} className="rounded-lg flex items-center justify-center p-4">
                <img src={yapeQR} alt="Yape QR" className="w-[200px] h-[200px] object-contain bg-transparent" />
              </div>
            ) : (
              <div style={{ background: '#08bedf' }} className="rounded-lg flex items-center justify-center p-4">
                <img src={yapeQR} alt="Plin QR" className="w-[200px] h-[200px] object-contain bg-transparent" />
              </div>
            )}
          </div>
          <div className="text-center text-sm text-gray-950 mt-2 mb-1">
            ¡Tu donación nos ayuda a seguir mejorando la plataforma! <button onClick={() => {
              setOpen(false);
            }} className='underline cursor-pointer text-blue-900'>Cerrar.</button>
          </div>
        </div>
      )}
    </>
  );
}
