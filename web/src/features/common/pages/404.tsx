import { Header } from '@common/components/header';
import { Layout } from '@common/components/layout';
import { useLocation } from 'wouter';

export function NotFoundPage() {
  const [pathname,] = useLocation();

  return (
    <Layout>
      <Header />
      <div className='flex flex-col items-center justify-center h-48'>
        <div>404 not found</div>
        <div>{pathname}</div>
      </div>
    </Layout>
  );
}
