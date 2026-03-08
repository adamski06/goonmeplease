import { useEffect, useState } from 'react';
import { useNavigate, Outlet, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { LogOut, Shield } from 'lucide-react';
import JarlaLoader from '@/components/JarlaLoader';
import { cn } from '@/lib/utils';

const AdminLayout = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/', { replace: true });
      return;
    }
    supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle()
      .then(({ data }) => {
        if (!data) {
          navigate('/', { replace: true });
        } else {
          setAuthorized(true);
        }
      });
  }, [user, authLoading, navigate]);

  if (authLoading || authorized === null) return <JarlaLoader />;

  const navItems = [
    { label: 'Review Queue', path: '/admin' },
    { label: 'All Ads', path: '/admin/all-ads' },
    { label: 'Businesses', path: '/admin/businesses' },
    { label: 'Creators', path: '/admin/creators' },
    { label: 'Settings', path: '/admin/settings' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b bg-card px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-montserrat font-semibold text-lg">Admin</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => signOut()}>
            <LogOut className="h-4 w-4 mr-1.5" /> Sign out
          </Button>
        </div>
        <nav className="flex gap-4 mt-3">
          {navItems.map((item) => {
            const isActive = item.path === '/admin'
              ? location.pathname === '/admin' || location.pathname.startsWith('/admin/business')
              : location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'text-sm font-medium pb-2 border-b-2 transition-colors',
                  isActive ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
