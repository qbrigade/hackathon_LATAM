import { useState, useRef, useEffect } from 'react';
import { Button } from '@common/components/button';
import { TABS } from '@common/constants';
import { Link, useLocation } from 'wouter';
import { ContentLayout } from './content_layout';
import { useAuthStore } from '@auth/store/auth_store';
import { db } from '@db/client';
import { useQuery } from '@tanstack/react-query';
import { User, ChevronDown, Plus, FileText, Briefcase, Calendar } from 'lucide-react'; // Importamos íconos adicionales
import logo from '@assets/images/logo_with_text.png';
import ContentLoader from 'react-content-loader';

export const HEADER_NAV_HEIGHT = 46;
export const HEADER_BAR_HEIGHT = 72;
export const HEADER_FULL_HEIGHT = HEADER_NAV_HEIGHT + HEADER_BAR_HEIGHT;

type HeaderProps = React.HTMLAttributes<HTMLDivElement> & {
  showNavigation?: boolean;
};

export const NoAvatarImg = (
  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer">
    <User size={18} className='text-gray-600' />
  </div>
);

export function Header({ showNavigation, ...rest }: HeaderProps) {
  const [pathname] = useLocation();
  const { user, clearUser } = useAuthStore();
  const [openCreateMenu, setOpenCreateMenu] = useState(false); // Estado para el menú "Crear"
  const [openProfileMenu, setOpenProfileMenu] = useState(false); // Estado para el menú "Perfil"
  const createMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await db.auth.signOut();
    clearUser();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (createMenuRef.current && !createMenuRef.current.contains(event.target as Node)) {
        setOpenCreateMenu(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setOpenProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const {
    data: votesLeft,
    isLoading: isVotesLoading,
    isError: isVotesError,
  } = useQuery({
    queryKey: ['votes_left', user?.id],
    queryFn: async () => {
      if (!user) return null;
      return 0;
    },
    enabled: !!user,
    staleTime: 60 * 1000, // 1 minute
  });

  return (
    <header
      {...rest}
      style={{
        whiteSpace: 'nowrap',
        backgroundColor: 'white',
        position: 'sticky',
        zIndex: 6969,
        top: 0,
        ...rest.style,
      }}
    >
      <ContentLayout>
        <div className='flex justify-between items-end py-4' style={{ height: `calc(env(safe-area-inset-top) + ${HEADER_BAR_HEIGHT}px)`, }}>
          <Link href='/'>
            <div className='flex items-center gap-3'>
              <img src={logo} alt='logo' className='h-9' />
            </div>
          </Link>
          <div className='flex gap-4 items-center relative text-sm'>
            <Link className='cursor-pointer' href='/about'>
              <div className='hidden md:flex hover:text-[#C4320A]'>About</div>
            </Link>

            {/* Menú "Crear" */}
            {user &&
              <div className='relative' ref={createMenuRef}>
                <button
                  onClick={() => setOpenCreateMenu(!openCreateMenu)}
                  className='hidden md:flex items-center gap-1 px-4 py-2 border border-gray-300 rounded-md bg-primary text-sm font-medium text-white hover:bg-primary-border cursor-pointer'
                >
                  <Plus size={16} />
                  Crear
                  <ChevronDown size={16} />
                </button>
                {openCreateMenu && (
                  <div className='absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded shadow-md z-50'>
                    <Link href='/feed/crear'>
                      <div className='flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer'>
                        <FileText size={16} />
                        Crear publicación
                      </div>
                    </Link>
                    <Link href='/proyectos/crear'>
                      <div className='flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer'>
                        <Briefcase size={16} />
                        Crear proyecto
                      </div>
                    </Link>
                    <Link href='/eventos/crear'>
                      <div className='flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer'>
                        <Calendar size={16} />
                        Crear evento
                      </div>
                    </Link>
                  </div>
                )}
              </div>
            }

            {/* Votes left (when authenticated) */}
            {user && (
              <div className='flex items-center gap-2 min-w-[120px]'>
                {isVotesLoading ? (
                  <ContentLoader
                    speed={2}
                    width={80}
                    height={20}
                    viewBox='0 0 80 20'
                    backgroundColor='#ededed'
                    foregroundColor='#ecebeb'
                    style={{ width: 80, height: 20 }}
                  >
                    <rect x='0' y='4' rx='4' ry='4' width='80' height='12' />
                  </ContentLoader>
                ) : votesLeft !== null && !isVotesError ? (
                  <span className='text-sm text-gray-700'>
                    Votos restantes: <strong>{votesLeft}</strong>
                  </span>
                ) : null}
              </div>
            )}

            {/* Menú de perfil */}
            {!user ? (
              <>
                <Link className='cursor-pointer' href='/login'>
                  <Button variant='white' className='font-semibold hidden lg:flex items-center'>
                    Login
                  </Button>
                </Link>
                <Link to='/signup'>
                  <Button variant='red' className='font-semibold'>Signup</Button>
                </Link>
              </>
            ) : (
              /* Menú "Perfil" */
              <div className='relative' ref={profileMenuRef}>
                <button
                  onClick={() => setOpenProfileMenu(!openProfileMenu)}
                  className='rounded-full hover:bg-gray-100 flex items-center justify-center cursor-pointer'
                >
                  {user?.profile?.avatar_url ? (
                    <img
                      src={user.profile.avatar_url}
                      alt="User avatar"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : NoAvatarImg}
                </button>
                {openProfileMenu && (
                  <div className='absolute right-0 mt-2 w-40 bg-white border border-gray-300 rounded z-50'>
                    <Link href='/perfil'>
                      <div className='px-4 py-2 hover:bg-gray-100 cursor-pointer'>Mi perfil</div>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className='w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600 cursor-pointer'
                    >
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </ContentLayout>

      {showNavigation !== false && (
        <nav
          style={{
            height: 46,
            backgroundColor: 'var(--color-on-primary)',
            borderTop: '1px solid var(--color-border)',
          }}
        >
          <ContentLayout style={{ height: 46, paddingBottom: '3px', paddingTop: '2px' }}>
            <div className='flex items-center gap-6 h-full'>
              {TABS.map((tab) => (
                <Link
                  key={tab.name}
                  href={tab.href}
                  className={`flex items-center h-full ${tab.regex.test(pathname) ? 'border-b-3 border-primary' : ''
                    }`}
                >
                  {tab.name}
                </Link>
              ))}
            </div>
          </ContentLayout>
        </nav>
      )}
    </header>
  );
}
