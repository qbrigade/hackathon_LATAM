import React, { useEffect, useRef, useState } from 'react';
import { StrictMode } from 'react';
import { Route, Switch, useLocation } from 'wouter';
import { createRoot } from 'react-dom/client';
import { HomePage } from '@home/pages/home';
import { MapPage } from './features/map/pages/map';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useQueryFavicon } from '@hooks/query_favicon';
import { onOpenUrl } from '@tauri-apps/plugin-deep-link';

import 'react-day-picker/style.css';
import 'leaflet/dist/leaflet.css';
import './index.css';
import { Toaster } from 'sonner';
import { ProfilePage } from '@profile/pages/profile';
import { UserProfileDetail } from '@profile/pages/user_profile';
import { APIProvider } from '@vis.gl/react-google-maps';
import { useAuthStore } from '@auth/store/auth_store';
import { db } from '@db/client';
import { IS_TAURI } from '@common/utils';
import { SignUpPage } from '@auth/pages/signup';
import { LoginPage } from '@auth/pages/login';
import { ConfirmEmailPage } from '@auth/pages/confirm_email';
import { CompleteRegisterPage } from '@auth/pages/complete_register';
import { NotFoundPage } from '@common/pages/404';
import { AuthProvider } from '@auth/providers/auth_provider';
import { RouteGuard } from '@auth/guards/route-guards';

export function QBrigadeRouter() {
  useQueryFavicon();
  const { user } = useAuthStore();
  const retryAuthInterval = useRef<number>(0);
  const [pathname] = useLocation();

  useEffect(() => {
    const handleFocus = async () => {
      if (user?.confirmed_at) return;

      const storedCredentials = localStorage.getItem('auth_credentials');
      if (!storedCredentials) return;

      try {
        const { email, password } = JSON.parse(storedCredentials);
        const { error } = await db.auth.signInWithPassword({
          email,
          password,
        });

        if (error?.code === 'email_not_confirmed') {
          // Keep trying until the email is confirmed
          return;
        }

        if (error?.code === 'invalid_credentials') {
          // Invalid credentials, remove the credentials
          localStorage.removeItem('auth_credentials');
          return;
        }

        if (!error) {
          localStorage.removeItem('auth_credentials');
        }
      } catch (error) {
        console.error('Error reauthenticating:', error);
      }
    };

    // Add focus event listener
    retryAuthInterval.current = window.setInterval(handleFocus, 3000);

    // Also try immediately when component mounts
    handleFocus();

    return () => {
      clearInterval(retryAuthInterval.current);
    };
  }, [user]);

  return (
    <>
      <CachedTabsRouter activePath={pathname} />
      {!isCachedTab(pathname) && (
        <Switch>
          <Route path='/signup' component={SignUpPage} />
          <Route path='/login' component={LoginPage} />
          <Route path='/confirmar-correo' component={ConfirmEmailPage} />
          <Route path='/completar-registro' component={CompleteRegisterPage} />
          <Route path='/perfil' component={ProfilePage} />
          <Route path="/u/:id">
            {({ id }) => <UserProfileDetail id={id} />}
          </Route>
          <Route>
            <NotFoundPage />
          </Route>
        </Switch>
      )}
    </>
  );
}

const queryClient = new QueryClient();

// https://tanstack.com/query/v4/docs/framework/react/devtools
const ReactQueryDevtoolsProduction = React.lazy(() =>
  import('@tanstack/react-query-devtools/build/modern/production.js').then(
    (d) => ({
      default: d.ReactQueryDevtools,
    }),
  ),
);

function QBrigadeRoot() {
  const [showDevtools, setShowDevtools] = useState(import.meta.env.DEV); // shown by default in DEV

  useEffect(() => {
    // @ts-expect-error adding a new global function
    window.toggleDevtools = () => setShowDevtools((old) => !old);
  }, []);

  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
          <RouteGuard>
            {/* <DonationWindow /> */}
            <QBrigadeRouter />
          </RouteGuard>
          </APIProvider>
        </AuthProvider>
        <Toaster position="bottom-right" richColors />
        {showDevtools && (
          <React.Suspense fallback={null}>
            <ReactQueryDevtoolsProduction />
          </React.Suspense>
        )}
      </QueryClientProvider>
    </StrictMode>
  );
}

// @ts-expect-error adding a new global function
window.androidBackCallback = () => {
  history.back();
  return false;
};

if (IS_TAURI) {
  onOpenUrl(async (urls) => {
    if (urls.length === 0) {
      return;
    }

    if (!urls[0].includes('access_token')) {
      return;
    }

    const url = new URL(urls[0]);

    // Parse the fragment (hash) part of the URL
    const fragment = url.hash.substring(1); // Remove the # character
    const fragmentParams = new URLSearchParams(fragment);

    await db.auth.setSession({
      access_token: fragmentParams.get('access_token')!,
      refresh_token: fragmentParams.get('refresh_token')!,
    });
  });
}

createRoot(document.getElementById('root')!).render(<QBrigadeRoot />);

function isCachedTab(pathname: string) {
  return pathname === '/' || pathname.startsWith('/map');
}

function CachedTabsRouter({ activePath }: { activePath: string }) {
  const [homeMounted, setHomeMounted] = useState(activePath === '/');
  const [mapMounted, setMapMounted] = useState(activePath.startsWith('/map'));

  useEffect(() => {
    if (activePath === '/') setHomeMounted(true);
    if (activePath.startsWith('/map')) setMapMounted(true);
  }, [activePath]);

  return (
    <>
      {homeMounted && (
        <div style={{ display: activePath === '/' ? 'block' : 'none' }}>
          <HomePage />
        </div>
      )}
      {mapMounted && (
        <div style={{ display: activePath.startsWith('/map') ? 'block' : 'none' }}>
          <MapPage />
        </div>
      )}
    </>
  );
}
