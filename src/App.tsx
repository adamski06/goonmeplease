import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProfileProvider } from "@/contexts/ProfileContext";
import JarlaLoader from "@/components/JarlaLoader";
import jarlaLogoSrc from "@/assets/jarla-logo.png";

const BusinessLoader = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-5">
    <img src={jarlaLogoSrc} alt="Jarla" className="h-5 dark:invert-0 invert" />
    <div className="h-3.5 w-3.5 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
  </div>
);

// Lazy-loaded pages
const Auth = lazy(() => import("./pages/Auth"));
const UserLayout = lazy(() => import("./components/UserLayout"));
const CampaignDetail = lazy(() => import("./pages/CampaignDetail"));
const EditProfile = lazy(() => import("./pages/EditProfile"));
const Settings = lazy(() => import("./pages/Settings"));
const NotFound = lazy(() => import("./pages/NotFound"));
const BusinessAuth = lazy(() => import("./pages/business/BusinessAuth"));
const BusinessLayout = lazy(() => import("./components/business/BusinessLayout"));
const BusinessProfile = lazy(() => import("./pages/business/BusinessProfile"));
const CreateCampaign = lazy(() => import("./pages/business/CreateCampaign"));
const BusinessCampaigns = lazy(() => import("./pages/business/BusinessCampaigns"));
const BusinessCampaignDetail = lazy(() => import("./pages/business/BusinessCampaignDetail"));
const BusinessSubmissionDetail = lazy(() => import("./pages/business/BusinessSubmissionDetail"));
const BusinessEditProfile = lazy(() => import("./pages/business/BusinessEditProfile"));
const BusinessSettings = lazy(() => import("./pages/business/BusinessSettings"));
const BusinessDeals = lazy(() => import("./pages/business/BusinessDeals"));
const CreateDeal = lazy(() => import("./pages/business/CreateDeal"));
const BusinessDealDetail = lazy(() => import("./pages/business/BusinessDealDetail"));
const BusinessDealSubmissionDetail = lazy(() => import("./pages/business/BusinessDealSubmissionDetail"));
const CreateCampaignChooser = lazy(() => import("./pages/business/CreateCampaignChooser"));

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
            <Suspense fallback={<JarlaLoader />}>
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
                {/* Business routes — white loader */}
                <Route path="/business/auth" element={<Suspense fallback={<BusinessLoader />}><BusinessAuth /></Suspense>} />
                <Route path="/business" element={<Suspense fallback={<BusinessLoader />}><BusinessLayout /></Suspense>}>
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
            </Suspense>
            </ProfileProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
