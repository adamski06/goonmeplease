import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProfileProvider } from "@/contexts/ProfileContext";
import Auth from "./pages/Auth";
import UserLayout from "./components/UserLayout";
import CampaignDetail from "./pages/CampaignDetail";
import EditProfile from "./pages/EditProfile";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import BusinessAuth from "./pages/business/BusinessAuth";
import BusinessLayout from "./components/business/BusinessLayout";
import BusinessProfile from "./pages/business/BusinessProfile";
import CreateCampaign from "./pages/business/CreateCampaign";
import BusinessCampaigns from "./pages/business/BusinessCampaigns";
import BusinessCampaignDetail from "./pages/business/BusinessCampaignDetail";
import BusinessSubmissionDetail from "./pages/business/BusinessSubmissionDetail";
import BusinessEditProfile from "./pages/business/BusinessEditProfile";
import BusinessSettings from "./pages/business/BusinessSettings";
import BusinessDeals from "./pages/business/BusinessDeals";
import CreateDeal from "./pages/business/CreateDeal";
import BusinessDealDetail from "./pages/business/BusinessDealDetail";
import BusinessDealSubmissionDetail from "./pages/business/BusinessDealSubmissionDetail";
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
                {/* User tab pages — kept mounted via UserLayout */}
                <Route path="/user" element={<UserLayout />} />
                <Route path="/user/discover" element={<UserLayout />} />
                <Route path="/user/activity" element={<UserLayout />} />
                <Route path="/user/alerts" element={<UserLayout />} />
                <Route path="/user/profile" element={<UserLayout />} />
                {/* User sub-pages */}
                <Route path="/user/auth" element={<Auth />} />
                <Route path="/user/campaigns/:id" element={<CampaignDetail />} />
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
                  <Route path="campaigns/:id/submissions/:submissionId" element={<BusinessSubmissionDetail />} />
                  <Route path="deals" element={<BusinessDeals />} />
                  <Route path="deals/new" element={<CreateDeal />} />
                  <Route path="deals/:id" element={<BusinessDealDetail />} />
                  <Route path="deals/:id/applications/:applicationId" element={<BusinessDealSubmissionDetail />} />
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
