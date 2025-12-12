import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DashboardHeader: React.FC = () => {
  const { user } = useAuth();

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <header className="h-16 border-b border-border bg-white px-6 flex items-center justify-between">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Creator Dashboard</h2>
      </div>
      
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-foreground text-background text-xs rounded-full flex items-center justify-center font-bold">
            0
          </span>
        </Button>
        
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 border border-border">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback className="text-xs bg-muted text-foreground">
              {user?.email ? getInitials(user.email) : 'U'}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-foreground hidden md:block">
            {user?.user_metadata?.full_name || user?.email}
          </span>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
