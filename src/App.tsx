import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProfileProvider } from "@/contexts/ProfileContext";
import Auth from "./pages/Auth";
import Campaigns from "./pages/Campaigns";
import Discover from "./pages/Discover";
import CampaignDetail from "./pages/CampaignDetail";
import Activity from "./pages/Activity";
import Alerts from "./pages/Alerts";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import EditProfile from "./pages/EditProfile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {/* Portrait orientation lock overlay */}
        <div className="landscape-lock-overlay fixed inset-0 z-[9999] bg-black items-center justify-center hidden">
          <div className="text-center text-white px-8">
            <svg className="h-16 w-16 mx-auto mb-4 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
              <line x1="12" y1="18" x2="12" y2="18" />
            </svg>
            <p className="text-lg font-semibold font-montserrat">Rotate your phone</p>
            <p className="text-sm text-white/60 mt-1 font-jakarta">This app works best in portrait mode</p>
          </div>
        </div>
        <BrowserRouter>
          <AuthProvider>
            <ProfileProvider>
              <Routes>
                <Route path="/" element={<Campaigns />} />
                <Route path="/discover" element={<Discover />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/campaigns/:id" element={<CampaignDetail />} />
                <Route path="/activity" element={<Activity />} />
                <Route path="/alerts" element={<Alerts />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/edit-profile" element={<EditProfile />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </ProfileProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
