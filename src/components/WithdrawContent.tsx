import React, { useState, useEffect } from 'react';
import { ChevronLeft, ExternalLink, Loader2, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface WithdrawContentProps {
  balance: number;
  onBack: () => void;
}

const WithdrawContent: React.FC<WithdrawContentProps> = ({ balance, onBack }) => {
  const { label, convert } = useCurrency();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [stripeConnected, setStripeConnected] = useState(false);
  const [pendingRequest, setPendingRequest] = useState<any>(null);
  const [minPayout, setMinPayout] = useState(9.5);
  const [error, setError] = useState('');

  const convertedBalance = convert(balance);
  const convertedMin = convert(minPayout);
  const formattedBalance = convertedBalance.toLocaleString('sv-SE');
  const isEligible = balance >= minPayout && stripeConnected && !pendingRequest;

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const [profileRes, settingRes, payoutRes] = await Promise.all([
        supabase.from('profiles').select('stripe_connect_id').eq('user_id', user.id).maybeSingle(),
        supabase.from('platform_settings').select('value').eq('key', 'min_payout_amount').maybeSingle(),
        supabase.from('payout_requests').select('*').eq('creator_id', user.id).in('status', ['pending', 'processing']).limit(1),
      ]);
      setStripeConnected(!!profileRes.data?.stripe_connect_id);
      if (settingRes.data) setMinPayout(parseFloat(settingRes.data.value));
      if (payoutRes.data && payoutRes.data.length > 0) setPendingRequest(payoutRes.data[0]);
      setLoading(false);
    };
    load();
  }, [user]);

  const handleConnectBank = async () => {
    setActionLoading(true);
    setError('');
    try {
      const { data, error: fnError } = await supabase.functions.invoke('create-connect-account', {
        body: { return_url: window.location.href },
      });
      if (fnError) throw fnError;
      if (data?.url) window.location.href = data.url;
    } catch (e: any) {
      setError(e.message || 'Failed to connect bank account');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestPayout = async () => {
    setActionLoading(true);
    setError('');
    try {
      const { data, error: fnError } = await supabase.functions.invoke('request-payout');
      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);
      setPendingRequest(data.request);
    } catch (e: any) {
      setError(e.message || 'Failed to request payout');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-white/40" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center px-6 pt-6 pb-4">
        <button onClick={onBack} className="p-1 -ml-1">
          <ChevronLeft className="h-5 w-5 text-white/60" />
        </button>
        <h2 className="text-base font-bold text-white font-montserrat flex-1 text-center pr-6">Withdraw</h2>
      </div>

      {/* Balance */}
      <div className="flex flex-col items-center px-6 pt-4 pb-6">
        <p className="text-sm text-white/50 font-jakarta mb-1">Available balance</p>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-white font-montserrat tracking-tight">
            {formattedBalance}
          </span>
          <span className="text-xl text-white/40 font-montserrat">{label}</span>
        </div>
      </div>

      {/* Status / Actions */}
      <div className="flex-1 px-6 space-y-4">
        {/* Pending payout request */}
        {pendingRequest && (
          <div className="flex items-center gap-3 p-4 rounded-2xl" style={{ background: 'rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.08)' }}>
            <Clock className="h-5 w-5 text-amber-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-black/80 font-montserrat">
                Payout {pendingRequest.status === 'processing' ? 'processing' : 'pending approval'}
              </p>
              <p className="text-xs text-black/45 font-jakarta">
                {convert(pendingRequest.amount).toLocaleString('sv-SE')} {label} · Requested {new Date(pendingRequest.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}

        {/* Not connected */}
        {!stripeConnected && !pendingRequest && (
          <div className="text-center space-y-4">
            <div className="h-14 w-14 rounded-full mx-auto flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.06)' }}>
              <ExternalLink className="h-6 w-6 text-black/45" />
            </div>
            <div>
              <p className="text-sm font-semibold text-black/80 font-montserrat">Connect your bank account</p>
              <p className="text-xs text-black/45 font-jakarta mt-1">
                Securely link your bank account to receive payouts directly
              </p>
            </div>
          </div>
        )}

        {/* Connected but below minimum */}
        {stripeConnected && !pendingRequest && balance < minPayout && (
          <div className="flex items-center gap-3 p-4 rounded-2xl" style={{ background: 'rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.08)' }}>
            <AlertCircle className="h-5 w-5 text-black/35 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-black/80 font-montserrat">Minimum not reached</p>
              <p className="text-xs text-black/45 font-jakarta">
                You need at least {Math.floor(convertedMin)} {label} to withdraw
              </p>
            </div>
          </div>
        )}

        {/* Connected and eligible */}
        {stripeConnected && !pendingRequest && balance >= minPayout && (
          <div className="flex items-center gap-3 p-4 rounded-2xl" style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-black/80 font-montserrat">Ready to withdraw</p>
              <p className="text-xs text-black/45 font-jakarta">
                Your payout will be reviewed before transfer
              </p>
            </div>
          </div>
        )}

        {error && (
          <p className="text-xs text-red-600 font-jakarta text-center">{error}</p>
        )}
      </div>

      {/* Action button */}
      <div className="px-6 py-5 flex-shrink-0">
        {!stripeConnected && !pendingRequest ? (
          <button
            onClick={handleConnectBank}
            disabled={actionLoading}
            className="w-full py-4 rounded-full text-base font-bold font-montserrat transition-all active:scale-[0.97] flex items-center justify-center gap-2"
            style={{
              background: 'rgba(0,0,0,0.85)',
              color: 'hsl(68, 70%, 85%)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            }}
          >
            {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
            Connect Bank Account
          </button>
        ) : !pendingRequest ? (
          <button
            onClick={handleRequestPayout}
            disabled={!isEligible || actionLoading}
            className="w-full py-4 rounded-full text-base font-bold font-montserrat transition-all active:scale-[0.97] flex items-center justify-center gap-2"
            style={{
              background: isEligible
                ? 'rgba(0,0,0,0.85)'
                : 'rgba(0,0,0,0.1)',
              color: isEligible ? 'hsl(68, 70%, 85%)' : 'rgba(0,0,0,0.25)',
              boxShadow: isEligible
                ? '0 4px 20px rgba(0,0,0,0.15)'
                : 'none',
            }}
          >
            {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Request Payout
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default WithdrawContent;
