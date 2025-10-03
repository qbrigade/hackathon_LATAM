import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuthStore } from '@auth/store/auth_store';

export const RouteGuard = ({ children }: { children: React.ReactNode }) => {
  const [location, setLocation] = useLocation();
  const { user, profileCompleted, authChecked, isConfirmed } = useAuthStore();

  useEffect(() => {
    if (!authChecked) return;

    const authPages = ['/login', '/signup', '/completar-registro', '/confirmar-correo'];
    const isOnAuthPage = authPages.includes(location);

    if (!user && location === '/completar-registro' ) {
      setLocation('/login');
      return;
    }

    if (!user && location === '/confirmar-correo' ) {
      setLocation('/login');
      return;
    }

    if (!user && location === '/perfil') {
      setLocation('/login');
      return;
    }

    if (user && !isConfirmed && location !== '/confirmar-correo') {
      setLocation('/confirmar-correo');
      return;
    }

    if (user && isConfirmed && !profileCompleted && location !== '/completar-registro') {
      setLocation('/completar-registro');
      return;
    }

    if (user && isConfirmed && profileCompleted && isOnAuthPage) {
      setLocation('/');
    }
  }, [user, profileCompleted, isConfirmed, authChecked, location, setLocation]);

  if (!authChecked) return null;

  return <>{children}</>;
};
