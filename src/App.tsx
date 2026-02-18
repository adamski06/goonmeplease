import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import BusinessAuth from "./pages/business/BusinessAuth";
import BusinessLayout from "./components/business/BusinessLayout";
import BusinessProfile from "./pages/business/BusinessProfile";
import CreateCampaign from "./pages/business/CreateCampaign";
import BusinessCampaigns from "./pages/business/BusinessCampaigns";
import BusinessCampaignDetail from "./pages/business/BusinessCampaignDetail";
import BusinessEditProfile from "./pages/business/BusinessEditProfile";
import BusinessSettings from "./pages/business/BusinessSettings";
import BusinessDeals from "./pages/business/BusinessDeals";
import CreateDeal from "./pages/business/CreateDeal";
import BusinessDealDetail from "./pages/business/BusinessDealDetail";
import CreateCampaignChooser from "./pages/business/CreateCampaignChooser";

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
                <Route path="/user" element={<Campaigns />} />
                <Route path="/user/discover" element={<Discover />} />
                <Route path="/user/auth" element={<Auth />} />
                <Route path="/user/campaigns/:id" element={<CampaignDetail />} />
                <Route path="/user/activity" element={<Activity />} />
                <Route path="/user/alerts" element={<Alerts />} />
                <Route path="/user/profile" element={<Profile />} />
                <Route path="/user/edit-profile" element={<EditProfile />} />
                <Route path="/user/settings" element={<Settings />} />
                {/* Business routes */}
                <Route path="/business/auth" element={<BusinessAuth />} />
                <Route path="/business" element={<BusinessLayout />}>
                  <Route index element={<BusinessProfile />} />
                  <Route path="new" element={<CreateCampaignChooser />} />
                  <Route path="edit-profile" element={<BusinessEditProfile />} />
                  <Route path="campaigns" element={<BusinessCampaigns />} />
                  <Route path="campaigns/new" element={<CreateCampaign />} />
                  <Route path="campaigns/:id" element={<BusinessCampaignDetail />} />
                  <Route path="deals" element={<BusinessDeals />} />
                  <Route path="deals/new" element={<CreateDeal />} />
                  <Route path="deals/:id" element={<BusinessDealDetail />} />
                  <Route path="settings" element={<BusinessSettings />} />
                </Route>
                <Route path="/" element={<Navigate to="/user" replace />} />
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
