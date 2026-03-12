import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n";
import { initNativeAuthHandler } from "./lib/nativeAuthHandler";
import { supabase } from "./integrations/supabase/client";

function renderNativeBridgeMessage(message: string) {
  const root = document.getElementById("root");
  if (!root) return;

  root.innerHTML =
    '<div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#000">' +
    `<p style="color:#fff;font-size:14px;font-family:system-ui">${message}</p></div>`;
}

function extractTokensFromLocation() {
  const searchParams = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));

  const accessToken = searchParams.get("access_token") || hashParams.get("access_token");
  const refreshToken = searchParams.get("refresh_token") || hashParams.get("refresh_token");

  return { accessToken, refreshToken };
}

function redirectBackToNative(scheme: string, accessToken: string, refreshToken: string) {
  const callbackUrl = `${scheme}://auth-callback?access_token=${encodeURIComponent(accessToken)}&refresh_token=${encodeURIComponent(refreshToken)}`;
  window.location.replace(callbackUrl);
}

/**
 * Native OAuth bridge for callback page:
 * - We redirect native users to /user/auth?native=<scheme>
 * - This page may receive tokens in hash/query OR receive session shortly after init
 * - We handle both cases before booting the React app
 */
async function handleNativeOAuthRedirect(): Promise<boolean> {
  const params = new URLSearchParams(window.location.search);
  const nativeScheme = params.get("native");

  if (!nativeScheme) return false;

  renderNativeBridgeMessage("Returning to app…");

  const directTokens = extractTokensFromLocation();
  if (directTokens.accessToken && directTokens.refreshToken) {
    redirectBackToNative(nativeScheme, directTokens.accessToken, directTokens.refreshToken);
    return true;
  }

  const { data: initialSessionData } = await supabase.auth.getSession();
  if (initialSessionData.session?.access_token && initialSessionData.session?.refresh_token) {
    redirectBackToNative(nativeScheme, initialSessionData.session.access_token, initialSessionData.session.refresh_token);
    return true;
  }

  await new Promise<void>((resolve) => {
    const timeout = window.setTimeout(() => {
      subscription?.unsubscribe();
      resolve();
    }, 6000);

    let subscription: { unsubscribe: () => void } | null = null;

    const authSub = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.access_token && session?.refresh_token) {
        window.clearTimeout(timeout);
        subscription?.unsubscribe();
        redirectBackToNative(nativeScheme, session.access_token, session.refresh_token);
        resolve();
      }
    });

    subscription = authSub.data.subscription;
  });

  renderNativeBridgeMessage("Could not return to app automatically. Please close this view and try again.");
  return true;
}

(async () => {
  const wasHandled = await handleNativeOAuthRedirect();

  if (!wasHandled) {
    initNativeAuthHandler();
    createRoot(document.getElementById("root")!).render(<App />);
  }
})();
