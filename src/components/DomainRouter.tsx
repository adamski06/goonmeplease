import { ReactNode, useMemo } from "react";
import Index from "@/pages/Index";

interface DomainRouterProps {
  children: ReactNode;
}

const LANDING_DOMAINS = ["jarla.org", "www.jarla.org"];

const DomainRouter = ({ children }: DomainRouterProps) => {
  // Memoize the hostname check to avoid unnecessary re-evaluations
  const isLandingDomain = useMemo(() => {
    const hostname = window.location.hostname;
    return LANDING_DOMAINS.some(domain => 
      hostname === domain || hostname.endsWith(`.${domain}`)
    );
  }, []);
  
  if (isLandingDomain) {
    return <Index />;
  }
  
  return <>{children}</>;
};

export default DomainRouter;
