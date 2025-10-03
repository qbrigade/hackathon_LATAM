import { Layout } from '@common/components/layout';
import { Sidebar } from '@common/components/sidebar';
import logo from '@assets/images/logo_v2.png';
import banner from '@assets/images/banner_wildfire.jpg';

export function HomePage() {
  return (
    <Layout>
      <div className='flex' style={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>
        <Sidebar />
        <main className='flex-1 text-gray-900' style={{ background: 'linear-gradient(180deg, #ecfdf5 0%, #d1fae5 35%, #f0fdf4 100%)' }}>
          <div className='p-6 pb-0'>
            <div className='h-64 w-full overflow-hidden rounded-2xl shadow relative' style={{ backgroundColor: '#064e3b' }}>
              <img src={banner} alt='Wildfire response banner' className='h-full w-full object-cover opacity-85' />
              <div className='absolute inset-0' style={{ background: 'linear-gradient(180deg, rgba(6,78,59,0.35) 0%, rgba(6,78,59,0.55) 60%, rgba(6,78,59,0.75) 100%)' }}></div>
            </div>
          </div>
          <div className='w-full flex items-center justify-center px-6 py-8'>
            <div className='text-center max-w-xl'>
              <div className='inline-flex items-center justify-center rounded-full shadow mb-4' style={{ background: 'linear-gradient(135deg, #eef2ff 0%, #f0f9ff 100%)' }}>
                <img src={logo} alt='QBrigade' className='h-24 w-24 rounded-full' />
              </div>
              <h1 className='text-7xl font-serif font-semibold' style={{ color: '#0f172a' }}>QBrigade</h1>
              <p className='mt-3 text-2xl' style={{ color: '#14532d' }}>Quantum computing for wildfire management</p>
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
}
