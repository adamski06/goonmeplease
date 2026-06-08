import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export default function LinkedInCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
        const tokenHash = hash.get('token_hash');
        const email = hash.get('email');
        if (!tokenHash || !email) {
          setError('Missing sign-in token.');
          return;
        }
        const { error: vErr } = await supabase.auth.verifyOtp({
          type: 'magiclink',
          token_hash: tokenHash,
        });
        if (vErr) {
          setError(vErr.message);
          return;
        }
        navigate('/user', { replace: true });
      } catch (e: any) {
        setError(e?.message ?? 'Unexpected error');
      }
    };
    run();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center px-6">
        {error ? (
          <>
            <p className="text-sm opacity-80 mb-4">{error}</p>
            <button
              onClick={() => navigate('/user/auth', { replace: true })}
              className="text-sm underline"
            >
              Back to sign in
            </button>
          </>
        ) : (
          <div className="h-6 w-6 mx-auto border-2 border-white/20 border-t-white rounded-full animate-spin" />
        )}
      </div>
    </div>
  );
}
