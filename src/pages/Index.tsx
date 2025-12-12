import { useState, useEffect } from "react";
import jarlaLogo from "@/assets/jarla-logo.png";

const Index = () => {
  const [activeTab, setActiveTab] = useState<'creator' | 'business'>('creator');
  const [showBackdrop, setShowBackdrop] = useState(false);

  useEffect(() => {
    setShowBackdrop(true);
  }, []);

  const TabButtons = () => (
    <>
      <button
        onClick={() => setActiveTab('creator')}
        className={`px-5 py-1.5 text-sm font-bold font-montserrat ${
          activeTab === 'creator' 
            ? 'bg-white text-black' 
            : 'text-white hover:bg-white hover:text-black'
        }`}
      >
        Creator
      </button>
      <button
        onClick={() => setActiveTab('business')}
        className={`px-5 py-1.5 text-sm font-bold font-montserrat ${
          activeTab === 'business' 
            ? 'bg-white text-black' 
            : 'text-white hover:bg-white hover:text-black'
        }`}
      >
        Business
      </button>
    </>
  );

  return <div className="bg-gradient-aurora">
      {/* Subtle noise texture */}
      <div className="noise-layer" />
      
      {/* Fixed Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-end gap-4">
        {/* Backdrop blur and shadow - fades in after delay */}
        <div 
          className={`absolute inset-x-0 top-0 h-24 -z-10 pointer-events-none transition-opacity duration-[2000ms] ${showBackdrop ? 'opacity-100' : 'opacity-0'}`}
          style={{
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0.2), transparent)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            maskImage: 'linear-gradient(to bottom, black 0%, black 50%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 50%, transparent 100%)'
          }}
        />
        
        <div className="relative h-8 md:h-10 w-[120px] md:w-[150px] flex items-center">
          <div 
            className="absolute inset-0 bg-white"
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
        <div className="flex border-2 border-white rounded-full overflow-hidden ml-8">
          <TabButtons />
        </div>
        
        {/* Nav buttons */}
        <button className="ml-8 px-4 pt-1 pb-[7px] text-sm font-bold font-montserrat text-white hover:opacity-80 transition-opacity">
          How do I earn money?
        </button>
        <button className="px-4 pt-1 pb-[7px] text-sm font-bold font-montserrat text-white hover:opacity-80 transition-opacity">
          About us
        </button>
        
        {/* Right side auth buttons */}
        <div className="ml-auto flex items-center gap-2">
          <button className="px-4 py-1.5 text-sm font-bold font-montserrat text-white hover:opacity-80 transition-opacity">
            Log in
          </button>
          <button className="px-5 py-1.5 text-sm font-bold font-montserrat bg-white text-black rounded-full hover:bg-white/90 transition-opacity">
            Sign up
          </button>
        </div>
      </nav>
      
      {/* Hero Section */}
      <section className="min-h-screen px-6 flex flex-col relative">
        <div className="flex-1 flex items-center justify-center">
          <div className="relative z-10 flex flex-col items-center gap-8 animate-fade-in-up">
            <p className="text-lg text-center whitespace-nowrap animate-fade-in-delayed w-full md:text-4xl font-bold text-muted font-montserrat">
              Human networks are the new distribution.
            </p>
          </div>
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