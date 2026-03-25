import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProfileProvider } from "@/contexts/ProfileContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import JarlaLoader from "@/components/JarlaLoader";
import { ScrollToTop } from "@/components/ScrollToTop";
import jarlaLogoSrc from "@/assets/jarla-logo.png";

/**
 * Lightweight root gate: checks auth immediately.
 * Logged in → redirect to /user (no Auth flash).
 * Loading → black screen (no spinner).
 * Not logged in → renders children (Auth page).
 */
const RootGate = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-black" />;
  }

  if (user) {
    return <Navigate to="/user" replace />;
  }

  return <>{children}</>;
};

const BusinessLoader = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-5">
    <img src={jarlaLogoSrc} alt="Jarla" className="h-5 dark:invert-0 invert" />
    <div className="h-3.5 w-3.5 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
  </div>
);

// Retry wrapper for dynamic imports — handles stale chunk errors after deploys
const lazyRetry = (importFn: () => Promise<any>) =>
  lazy(() =>
    importFn().catch(() => {
      // If chunk fails to load, force a full page reload (once)
      const hasReloaded = sessionStorage.getItem('chunk_reload');
      if (!hasReloaded) {
        sessionStorage.setItem('chunk_reload', '1');
        window.location.reload();
        return new Promise(() => {}); // never resolves, page reloads
      }
      sessionStorage.removeItem('chunk_reload');
      return importFn(); // retry once more after reload
    })
  );

// Lazy-loaded pages
const Auth = lazyRetry(() => import("./pages/Auth")); // Still needed for /user/auth
const UserLayout = lazyRetry(() => import("./components/UserLayout"));
const CampaignDetail = lazyRetry(() => import("./pages/CampaignDetail"));
const EditProfile = lazyRetry(() => import("./pages/EditProfile"));
const Settings = lazyRetry(() => import("./pages/Settings"));
const Support = lazyRetry(() => import("./pages/Support"));
const MoreSettings = lazyRetry(() => import("./pages/MoreSettings"));
const NotFound = lazyRetry(() => import("./pages/NotFound"));
const BusinessAuth = lazyRetry(() => import("./pages/business/BusinessAuth"));
const BusinessLayout = lazyRetry(() => import("./components/business/BusinessLayout"));
const BusinessProfile = lazyRetry(() => import("./pages/business/BusinessProfile"));
const CreateCampaign = lazyRetry(() => import("./pages/business/CreateCampaign"));
const BusinessCampaigns = lazyRetry(() => import("./pages/business/BusinessCampaigns"));
const BusinessCampaignDetail = lazyRetry(() => import("./pages/business/BusinessCampaignDetail"));
const BusinessSubmissionDetail = lazyRetry(() => import("./pages/business/BusinessSubmissionDetail"));
const BusinessEditProfile = lazyRetry(() => import("./pages/business/BusinessEditProfile"));
const BusinessSettings = lazyRetry(() => import("./pages/business/BusinessSettings"));
const BusinessDeals = lazyRetry(() => import("./pages/business/BusinessDeals"));
const CreateDeal = lazyRetry(() => import("./pages/business/CreateDeal"));
const BusinessDealDetail = lazyRetry(() => import("./pages/business/BusinessDealDetail"));
const BusinessDealSubmissionDetail = lazyRetry(() => import("./pages/business/BusinessDealSubmissionDetail"));
const CreateCampaignChooser = lazyRetry(() => import("./pages/business/CreateCampaignChooser"));
const AdTypesLibrary = lazyRetry(() => import("./pages/business/AdTypesLibrary"));
const BusinessRewards = lazyRetry(() => import("./pages/business/BusinessRewards"));
const BusinessRewardDetail = lazyRetry(() => import("./pages/business/BusinessRewardDetail"));
const CreateReward = lazyRetry(() => import("./pages/business/CreateReward"));
const BusinessRewardSubmissionDetail = lazyRetry(() => import("./pages/business/BusinessRewardSubmissionDetail"));
const RewardsEmbed = lazyRetry(() => import("./pages/RewardsEmbed"));
const PublicAd = lazyRetry(() => import("./pages/PublicAd"));
const PublicBrand = lazyRetry(() => import("./pages/PublicBrand"));
const EmbedAd = lazyRetry(() => import("./pages/EmbedAd"));
const AdminLayout = lazyRetry(() => import("./pages/admin/AdminLayout"));
const AdminReviewQueue = lazyRetry(() => import("./pages/admin/AdminReviewQueue"));
const AdminAllAds = lazyRetry(() => import("./pages/admin/AdminAllAds"));
const AdminDashboard = lazyRetry(() => import("./pages/admin/AdminDashboard"));
const AdminBusinessDetail = lazyRetry(() => import("./pages/admin/AdminBusinessDetail"));
const AdminCreators = lazyRetry(() => import("./pages/admin/AdminCreators"));
const AdminCreatorDetail = lazyRetry(() => import("./pages/admin/AdminCreatorDetail"));
const AdminSettings = lazyRetry(() => import("./pages/admin/AdminSettings"));

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
          <ScrollToTop />
          <AuthProvider>
            <CurrencyProvider>
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
                <Route path="/user/support" element={<Support />} />
                {/* Business routes — white loader */}
                <Route path="/business/auth" element={<Suspense fallback={<BusinessLoader />}><BusinessAuth /></Suspense>} />
                <Route path="/business" element={<Suspense fallback={<BusinessLoader />}><BusinessLayout /></Suspense>}>
                  <Route index element={<BusinessProfile />} />
                  <Route path="new" element={<CreateCampaignChooser />} />
                  <Route path="ad-types" element={<AdTypesLibrary />} />
                  <Route path="edit-profile" element={<BusinessEditProfile />} />
                  <Route path="campaigns" element={<BusinessCampaigns />} />
                  <Route path="campaigns/new" element={<CreateCampaign />} />
                  <Route path="campaigns/:id" element={<BusinessCampaignDetail />} />
                  <Route path="campaigns/:id/submissions/:submissionId" element={<BusinessSubmissionDetail />} />
                  <Route path="deals" element={<BusinessDeals />} />
                  <Route path="deals/new" element={<CreateDeal />} />
                  <Route path="deals/:id" element={<BusinessDealDetail />} />
                  <Route path="deals/:id/applications/:applicationId" element={<BusinessDealSubmissionDetail />} />
                  <Route path="rewards" element={<BusinessRewards />} />
                  <Route path="rewards/new" element={<CreateReward />} />
                  <Route path="rewards/:id" element={<BusinessRewardDetail />} />
                  <Route path="rewards/:id/submissions/:submissionId" element={<BusinessRewardSubmissionDetail />} />
                  <Route path="settings" element={<BusinessSettings />} />
                </Route>
                <Route path="/rewards-embed" element={<Suspense fallback={<BusinessLoader />}><RewardsEmbed /></Suspense>} />
                <Route path="/ad/:id" element={<Suspense fallback={<BusinessLoader />}><PublicAd /></Suspense>} />
                <Route path="/brand/:businessId" element={<Suspense fallback={<BusinessLoader />}><PublicBrand /></Suspense>} />
                <Route path="/embed/ad/:id" element={<Suspense fallback={<BusinessLoader />}><EmbedAd /></Suspense>} />
                <Route path="/admin" element={<Suspense fallback={<BusinessLoader />}><AdminLayout /></Suspense>}>
                  <Route index element={<AdminReviewQueue />} />
                  <Route path="all-ads" element={<AdminAllAds />} />
                  <Route path="businesses" element={<AdminDashboard />} />
                  <Route path="business/:userId" element={<AdminBusinessDetail />} />
                  <Route path="creators" element={<AdminCreators />} />
                  <Route path="creators/:userId" element={<AdminCreatorDetail />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>
                <Route path="/" element={<RootGate><Auth /></RootGate>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            </ProfileProvider>
            </CurrencyProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
