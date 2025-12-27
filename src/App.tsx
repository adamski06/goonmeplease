import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProfileProvider } from "@/contexts/ProfileContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Campaigns from "./pages/Campaigns";
import CampaignDetail from "./pages/CampaignDetail";
import Activity from "./pages/Activity";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import BusinessDashboard from "./pages/business/BusinessDashboard";
import BusinessCampaigns from "./pages/business/BusinessCampaigns";
import BusinessCampaignForm from "./pages/business/BusinessCampaignForm";
import BusinessCampaignDetail from "./pages/business/BusinessCampaignDetail";
import BusinessSubmissions from "./pages/business/BusinessSubmissions";
import BusinessAnalytics from "./pages/business/BusinessAnalytics";
import BusinessAuth from "./pages/BusinessAuth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <ProfileProvider>
              <Routes>
                <Route path="/" element={<Campaigns />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/landing" element={<Index />} />
                <Route path="/campaigns/:id" element={<CampaignDetail />} />
                <Route path="/activity" element={<Activity />} />
                <Route path="/profile" element={<Profile />} />
                {/* Business Routes */}
                <Route path="/business/auth" element={<BusinessAuth />} />
                <Route path="/business" element={<BusinessDashboard />} />
                <Route path="/business/campaigns" element={<BusinessCampaigns />} />
                <Route path="/business/campaigns/new" element={<BusinessCampaignForm />} />
                <Route path="/business/campaigns/:id" element={<BusinessCampaignDetail />} />
                <Route path="/business/campaigns/:id/edit" element={<BusinessCampaignForm />} />
                <Route path="/business/submissions" element={<BusinessSubmissions />} />
                <Route path="/business/analytics" element={<BusinessAnalytics />} />
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
