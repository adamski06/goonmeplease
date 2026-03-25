import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import BottomNav from '@/components/BottomNav';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, DollarSign, TrendingUp, Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  data: any;
}

const typeIcon: Record<string, React.ReactNode> = {
  video_approved: <CheckCircle className="h-5 w-5 text-green-500" />,
  earning_received: <DollarSign className="h-5 w-5 text-amber-500" />,
  payout_completed: <TrendingUp className="h-5 w-5 text-blue-500" />,
};

const Alerts: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/user/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;

    const fetch = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (data) setNotifications(data as Notification[]);
      setFetching(false);
    };
    fetch();

    // Mark all as read
    supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false)
      .then();

    // Realtime subscription
    const channel = supabase
      .channel('user-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="flex flex-col border-b border-black/10 safe-area-top">
        <div className="flex items-center justify-center px-4 py-3">
          <span className="text-base font-semibold text-black">Alerts</span>
        </div>
      </div>

      <div className="px-4 pt-3">
        {fetching ? (
          <div className="flex justify-center py-20">
            <div className="h-5 w-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Bell className="h-10 w-10 text-black/15" />
            <p className="text-black/40 text-sm font-jakarta">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-1">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`flex items-start gap-3 px-3 py-3 rounded-xl transition-colors ${
                  !n.is_read ? 'bg-black/[0.03]' : ''
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {typeIcon[n.type] || <Bell className="h-5 w-5 text-black/30" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-black font-montserrat">{n.title}</p>
                  <p className="text-xs text-black/60 font-jakarta mt-0.5 leading-relaxed">{n.message}</p>
                  <p className="text-[11px] text-black/30 font-jakarta mt-1">
                    {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                  </p>
                </div>
                {!n.is_read && (
                  <div className="mt-2 h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Alerts;
