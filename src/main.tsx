import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n";
import { initNativeAuthHandler } from "./lib/nativeAuthHandler";

/**
 * Handle native OAuth callback redirect.
 * When the published app receives OAuth tokens after Apple Sign In,
 * it redirects to: app.lovable.jarla://auth-callback?access_token=...&refresh_token=...
 * But FIRST, the published app page loads at /user/auth?native=app.lovable.jarla
 * with tokens in the hash fragment. This code intercepts that and redirects to the custom scheme.
 */
function handleNativeOAuthRedirect(): boolean {
  const params = new URLSearchParams(window.location.search);
  const nativeScheme = params.get('native');

  if (!nativeScheme) return false;

  // Extract tokens from hash fragment (Supabase/broker puts them there)
  const hash = window.location.hash.substring(1);
  const hashParams = new URLSearchParams(hash);

  const accessToken = hashParams.get('access_token');
  const refreshToken = hashParams.get('refresh_token');

  if (accessToken && refreshToken) {
    // Redirect to the native app via custom URL scheme
    window.location.href = `${nativeScheme}://auth-callback?access_token=${encodeURIComponent(accessToken)}&refresh_token=${encodeURIComponent(refreshToken)}`;

    // Show a simple loading state while redirecting
    document.getElementById('root')!.innerHTML =
      '<div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#000">' +
      '<p style="color:#fff;font-size:14px;font-family:system-ui">Returning to app…</p></div>';
    return true;
  }

  return false;
}

// If this is a native OAuth callback on the published site, redirect and stop
if (!handleNativeOAuthRedirect()) {
  // Normal app startup
  initNativeAuthHandler();
  createRoot(document.getElementById("root")!).render(<App />);
}
