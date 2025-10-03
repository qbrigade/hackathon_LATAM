import { TABS } from '@common/constants';
import { Link } from 'wouter';
import { ContentLayout } from './content_layout';
import logo from '@assets/images/logo_no_text.png';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <ContentLayout>
      <footer className='flex flex-col justify-start py-4 bg-white border-t-1 border-border'>

        <div className='flex items-center border-b-1 border-border pb-6 gap-16'>
          <img src={logo} alt='logo' width={128} />
          <div className='flex flex-col gap-2'>
            <div className='font-bold'>MENÚ</div>
            {
              TABS.map((tab) => (
                <Link
                  key={tab.name}
                  href={tab.href}
                  className='flex h-full mr-4'
                >
                  {tab.name}
                </Link>
              ))
            }
          </div>
        </div>
        <div className='text-sm mt-4'>
          © {year} QBrigade. Todos los derechos reservados.
        </div>
      </footer>
    </ContentLayout>
  );
}
