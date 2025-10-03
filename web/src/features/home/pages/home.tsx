import { Layout } from '@common/components/layout';
import { Sidebar } from '@common/components/sidebar';
import { useLocation } from 'wouter';
import logo from '@assets/images/logo_v2.png';
import heroBanner from '/readme_banner.png';

export function HomePage() {
  const [, setLocation] = useLocation();

  return (
    <Layout>
      <div className='flex flex-col md:flex-row' style={{ minHeight: '100vh', backgroundColor: '#000000' }}>
        <Sidebar />
        <main className='flex-1 overflow-x-hidden flex flex-col'>
          {/* Hero Banner - Aligned at top */}
          <div className='relative w-full' style={{ backgroundColor: '#000000' }}>
            <img
              src={heroBanner}
              alt='QBrigade - Igniting change, not forests'
              className='w-full h-auto'
            />
          </div>

          {/* Call to Action Section */}
          <div className='relative w-full py-16 md:py-20 px-4' style={{ background: 'linear-gradient(to bottom, #000000 0%, #0f172a 100%)' }}>
            <div className='max-w-4xl mx-auto text-center'>
              <p className='text-xl md:text-2xl mb-10 font-medium' style={{ color: 'rgba(255,255,255,0.85)' }}>
                Real-time decision-making for wildfire containment
              </p>

              {/* Action buttons */}
              <div className='flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-5'>
                  <button
                    onClick={() => setLocation('/map')}
                    className='w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg px-8 md:px-10 py-3.5 md:py-4 text-base md:text-lg font-semibold shadow-2xl hover:shadow-3xl transition-all cursor-pointer hover:scale-105'
                    style={{ backgroundColor: '#dc2626', color: '#ffffff' }}
                  >
                    <svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' className='md:w-6 md:h-6'>
                      <path d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z'></path>
                      <circle cx='12' cy='10' r='3'></circle>
                    </svg>
                    Open Wildfire Map
                  </button>

                  <a
                    href='https://github.com/qbrigade/hackathon_LATAM'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg px-8 md:px-10 py-3.5 md:py-4 text-base md:text-lg font-semibold transition-all cursor-pointer hover:scale-105'
                    style={{ color: '#ffffff', backgroundColor: 'rgba(255,255,255,0.1)', border: '2px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(10px)' }}
                  >
                    <svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='currentColor' className='md:w-6 md:h-6'>
                      <path d='M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.387.6.11.82-.26.82-.58 0-.29-.01-1.06-.015-2.08-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.334-1.757-1.334-1.757-1.09-.745.083-.73.083-.73 1.205.085 1.84 1.237 1.84 1.237 1.07 1.835 2.805 1.305 3.49.998.108-.775.42-1.305.763-1.605-2.665-.305-5.466-1.332-5.466-5.93 0-1.31.47-2.38 1.236-3.22-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.3 1.23a11.52 11.52 0 0 1 3.003-.403c1.02.005 2.047.137 3.004.403 2.29-1.552 3.297-1.23 3.297-1.23.653 1.652.242 2.873.118 3.176.77.84 1.235 1.91 1.235 3.22 0 4.61-2.806 5.624-5.48 5.92.43.37.814 1.096.814 2.21 0 1.595-.014 2.88-.014 3.27 0 .32.216.697.825.578C20.565 21.797 24 17.297 24 12 24 5.37 18.63 0 12 0z'/>
                    </svg>
                    View on GitHub
                  </a>
                </div>
              </div>
            </div>

          {/* Additional Content Section */}
          <div className='w-full px-4 md:px-6 py-16 md:py-20' style={{ background: 'linear-gradient(to bottom, #0f172a 0%, #000000 100%)' }}>
            <div className='text-center max-w-3xl mx-auto'>
              <div className='inline-flex items-center justify-center rounded-full shadow-2xl mb-6' style={{ background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)' }}>
                <img src={logo} alt='QBrigade' className='h-20 w-20 md:h-28 md:w-28 rounded-full' />
              </div>
              <h1 className='text-3xl md:text-6xl font-serif font-bold mb-4' style={{ color: '#ffffff', textShadow: '0 2px 20px rgba(59,130,246,0.5)' }}>
                Quantum Wildfire Brigade
              </h1>
              <p className='text-lg md:text-xl leading-relaxed' style={{ color: 'rgba(255,255,255,0.8)' }}>
                Harnessing quantum computing and AI to predict wildfire behavior and optimize resource allocation.
                Real-time decision-making solutions for wildfire prediction and containment.
              </p>
              <div className='mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6'>
                <div className='p-4 rounded-lg' style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div className='text-2xl md:text-3xl font-bold mb-2' style={{ color: '#3b82f6' }}>ConvLSTM</div>
                  <div className='text-sm' style={{ color: 'rgba(255,255,255,0.7)' }}>AI Fire Prediction</div>
                </div>
                <div className='p-4 rounded-lg' style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div className='text-2xl md:text-3xl font-bold mb-2' style={{ color: '#10b981' }}>QUBO</div>
                  <div className='text-sm' style={{ color: 'rgba(255,255,255,0.7)' }}>Quantum Optimization</div>
                </div>
                <div className='p-4 rounded-lg' style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div className='text-2xl md:text-3xl font-bold mb-2' style={{ color: '#f59e0b' }}>Real-time</div>
                  <div className='text-sm' style={{ color: 'rgba(255,255,255,0.7)' }}>Live Monitoring</div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
}
