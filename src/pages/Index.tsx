import { useState } from "react";
import { useNavigate } from "react-router-dom";
import jarlaLogo from "@/assets/jarla-logo.png";

const Index = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'creator' | 'business'>('creator');

  const handleTabChange = (tab: 'creator' | 'business') => {
    if (tab !== activeTab) {
      setActiveTab(tab);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const TabButtons = () => (
    <>
      <button
        onClick={() => handleTabChange('creator')}
        className={`px-5 py-1.5 text-sm font-bold font-montserrat transition-colors ${
          activeTab === 'creator'
            ? 'bg-background text-foreground rounded-full'
            : 'text-foreground/60 group-hover:text-background hover:text-background'
        }`}
      >
        Creator
      </button>
      <button
        onClick={() => handleTabChange('business')}
        className={`px-5 py-1.5 text-sm font-bold font-montserrat transition-colors ${
          activeTab === 'business'
            ? 'bg-background text-foreground rounded-full'
            : 'text-foreground/60 group-hover:text-background hover:text-background'
        }`}
      >
        Business
      </button>
    </>
  );

  return <div className="overflow-x-hidden relative">
      {/* Static Grainy Background */}
      <div className="fixed inset-0 grainy-background" />
      <div className="noise-layer fixed" />
      
      {/* Fixed Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
        {/* Constrained content container */}
        <div className="max-w-7xl mx-auto flex items-end gap-4">
          <div className="relative h-8 md:h-10 w-[120px] md:w-[150px] flex items-center">
            <div 
              className="absolute inset-0 bg-foreground"
              style={{
                WebkitMaskImage: `url(${jarlaLogo})`,
                maskImage: `url(${jarlaLogo})`,
                WebkitMaskSize: 'contain',
                maskSize: 'contain',
                WebkitMaskRepeat: 'no-repeat',
                maskRepeat: 'no-repeat',
                WebkitMaskPosition: 'left center',
                maskPosition: 'left center'
              }} 
            />
          </div>
          
          {/* Tabs next to logo */}
          <div className="group flex bg-black/10 hover:bg-foreground rounded-full overflow-hidden ml-8 transition-colors">
            <TabButtons />
          </div>
          
          {/* Nav buttons */}
          <button className="ml-8 px-4 pt-1 pb-[7px] text-sm font-bold font-montserrat text-foreground hover:opacity-80 transition-opacity">
            {activeTab === 'creator' ? 'How do I earn money?' : 'Pricing'}
          </button>
          <button className="px-4 pt-1 pb-[7px] text-sm font-bold font-montserrat text-foreground hover:opacity-80 transition-opacity">
            About us
          </button>
          <button className="px-4 pt-1 pb-[7px] text-sm font-bold font-montserrat text-foreground hover:opacity-80 transition-opacity">
            Careers
          </button>
          
          {/* Right side button - only show in creator mode */}
          {activeTab === 'creator' && (
            <div className="ml-auto">
              <button 
                onClick={() => navigate('/')}
                className="px-6 py-2 text-base font-bold font-montserrat bg-foreground text-background rounded-full transition-all duration-300 hover:opacity-90"
              >
                Start earning
              </button>
            </div>
          )}
        </div>
      </nav>
      
      {/* Hero Section */}
      <section className="min-h-screen px-6 flex flex-col relative">
        <div className={`flex-1 flex items-center max-w-7xl mx-auto w-full ${activeTab === 'business' ? 'justify-center' : 'justify-center gap-16'}`}>
          <div className={`relative z-10 flex flex-col gap-8 animate-fade-in-up ${activeTab === 'business' ? 'w-full items-center' : ''}`}>
            <h1 className={`animate-fade-in-delayed font-bold text-foreground font-montserrat ${activeTab === 'business' ? 'text-center' : 'text-left'}`}>
              {activeTab === 'creator' ? (
                <div className="mt-16 text-center">
                  <span className="block text-6xl md:text-8xl">Earn money</span>
                  <span className="block text-6xl md:text-8xl">
                    per{' '}
                    <span className="inline-block">
                      <span className="inline-block text-foreground">
                        view
                      </span>
                    </span>
                  </span>
                  <div className="flex justify-center mt-8">
                    <button 
                      onClick={() => navigate('/')}
                      className="px-12 py-4 text-xl font-bold font-montserrat bg-foreground text-background rounded-full transition-all duration-300 hover:opacity-90"
                    >
                      Start earning
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-80">
                  <span className="block text-4xl md:text-6xl">Human network</span>
                  <span className="block text-4xl md:text-6xl">is the new distribution</span>
                  <div className="flex justify-center mt-8">
                    <button 
                      onClick={() => navigate('/business/auth')}
                      className="px-12 py-4 text-xl font-bold font-montserrat bg-foreground text-background rounded-full transition-all duration-300 hover:opacity-90"
                    >
                      Get started
                    </button>
                  </div>
                </div>
              )}
            </h1>
          </div>
          {/* Vertical video placeholder - right side (only for creator) */}
          {activeTab === 'creator' && (
            <div className="flex items-center justify-center">
              <div className="w-56 h-[400px] bg-black/5 dark:bg-white/10 backdrop-blur-sm rounded-[4px] flex items-center justify-center">
                <span className="text-muted-foreground text-sm font-montserrat">Video</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Section 2 */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 relative z-10">
        <div className="max-w-2xl text-center">
          <h2 className="text-4xl md:text-6xl font-semibold text-foreground mb-6">
            Section Two
          </h2>
          <p className="text-lg text-muted-foreground">
            Add your content here.
          </p>
        </div>
      </section>

      {/* Section 3 */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 relative z-10">
        <div className="max-w-2xl text-center">
          <h2 className="text-4xl md:text-6xl font-semibold text-foreground mb-6">
            Section Three
          </h2>
          <p className="text-lg text-muted-foreground">
            Add your content here.
          </p>
        </div>
      </section>
    </div>;
};
export default Index;