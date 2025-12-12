import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

  const isActive = (path: string, end?: boolean) => {
    if (end) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="w-64 h-screen bg-white border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <button 
          onClick={() => navigate('/')}
          className="relative h-8 w-[120px] cursor-pointer"
        >
          <div 
            className="absolute inset-0 bg-foreground"
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
        </button>
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
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-border">
        <button
          onClick={signOut}
          className="flex items-center gap-3 px-4 py-3 rounded-full text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200 w-full"
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
