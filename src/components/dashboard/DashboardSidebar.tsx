import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Megaphone, 
  Video, 
  DollarSign, 
  Settings,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import jarlaLogo from '@/assets/jarla-logo.png';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/dashboard/campaigns', icon: Megaphone, label: 'Campaigns' },
  { to: '/dashboard/content', icon: Video, label: 'My Content' },
  { to: '/dashboard/earnings', icon: DollarSign, label: 'Earnings' },
  { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

const DashboardSidebar: React.FC = () => {
  const { signOut } = useAuth();
  const location = useLocation();

  const isActive = (path: string, end?: boolean) => {
    if (end) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="w-64 h-screen bg-[hsl(220,20%,8%)] border-r border-white/10 flex flex-col">
      <div className="p-6 border-b border-white/10">
        <div className="relative h-8 w-[120px]">
          <div 
            className="absolute inset-0 bg-white"
            style={{
              WebkitMaskImage: `url(${jarlaLogo})`,
              maskImage: `url(${jarlaLogo})`,
              WebkitMaskSize: 'contain',
              maskSize: 'contain',
              WebkitMaskRepeat: 'no-repeat',
              maskRepeat: 'no-repeat',
              WebkitMaskPosition: 'left center',
              maskPosition: 'left center'
            }} 
          />
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-full text-sm font-medium transition-all duration-200',
              isActive(item.to, item.end)
                ? 'bg-white text-black'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={signOut}
          className="flex items-center gap-3 px-4 py-3 rounded-full text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-all duration-200 w-full"
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
