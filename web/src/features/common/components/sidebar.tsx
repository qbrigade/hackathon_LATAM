import { useLocation, Link } from 'wouter';
import { Home, Map, ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import logo from '@assets/images/logo_no_text.png';

type NavItem = {
  name: string;
  href: string;
  icon: React.ReactNode;
  match: (path: string) => boolean;
};

export function Sidebar() {
  const [pathname] = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const items = useMemo<NavItem[]>(() => [
    {
      name: 'Landing',
      href: '/',
      icon: <Home size={18} />,
      match: (p) => p === '/',
    },
    {
      name: 'Map',
      href: '/map',
      icon: <Map size={18} />,
      match: (p) => p.startsWith('/map'),
    },
  ], []);

  const width = collapsed ? 60 : 72;

  return (
    <aside
      className="h-screen sticky top-0 flex flex-col justify-between"
      style={{ width, backgroundColor: '#0b0b0b', borderRight: '1px solid #1f1f1f' }}
    >
      <div className="flex flex-col items-center py-3 gap-2">
        <div className="w-full flex items-center justify-center mb-2">
          <img src={logo} alt="Logo" className="h-8" />
        </div>
        {items.map((item) => {
          const active = item.match(pathname);
          return (
            <Link key={item.name} href={item.href} className="w-full">
              <div
                className={`mx-2 mt-1 rounded-md cursor-pointer flex items-center justify-center h-10 ${active ? 'bg-[#161616] text-white' : 'text-gray-300 hover:bg-[#111111] hover:text-white'}`}
                title={item.name}
              >
                {item.icon}
              </div>
            </Link>
          );
        })}
      </div>
      <div className="p-2 flex items-center justify-between w-full">
        <div className="text-[10px] text-gray-500 select-none">v1</div>
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="rounded-md border border-[#1f1f1f] bg-[#0f0f0f] text-gray-300 hover:text-white hover:bg-[#111111] cursor-pointer"
          style={{ width: 28, height: 28 }}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  );
}


