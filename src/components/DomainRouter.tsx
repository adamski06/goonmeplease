import { ReactNode } from "react";
import Index from "@/pages/Index";

interface DomainRouterProps {
  children: ReactNode;
}

const LANDING_DOMAINS = ["jarla.org", "www.jarla.org"];

const DomainRouter = ({ children }: DomainRouterProps) => {
  const hostname = window.location.hostname;
  
  // Check if we're on the landing page domain
  const isLandingDomain = LANDING_DOMAINS.some(domain => 
    hostname === domain || hostname.endsWith(`.${domain}`)
  );
  
  if (isLandingDomain) {
    return <Index />;
  }
  
  return <>{children}</>;
};

export default DomainRouter;
