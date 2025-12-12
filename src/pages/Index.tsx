import { useState, useEffect } from "react";
import jarlaLogo from "@/assets/jarla-logo.png";

const Index = () => {
  const [activeTab, setActiveTab] = useState<'creator' | 'business'>('creator');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const TabButtons = () => (
    <>
      <button
        onClick={() => setActiveTab('creator')}
        className={`px-4 py-1.5 rounded-full text-sm font-bold font-montserrat transition-all duration-300 ${
          activeTab === 'creator' 
            ? 'bg-background text-foreground shadow-sm' 
            : 'text-foreground/60 hover:text-foreground'
        }`}
      >
        Creator
      </button>
      <button
        onClick={() => setActiveTab('business')}
        className={`px-4 py-1.5 rounded-full text-sm font-bold font-montserrat transition-all duration-300 ${
          activeTab === 'business' 
            ? 'bg-background text-foreground shadow-sm' 
            : 'text-foreground/60 hover:text-foreground'
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
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center">
        <div className="relative h-8 md:h-10 w-[120px] md:w-[150px]">
          <div 
            className="absolute inset-0 logo-dark animate-fade-in"
            style={{
              WebkitMaskImage: `url(${jarlaLogo})`,
              maskImage: `url(${jarlaLogo})`,
              WebkitMaskSize: 'contain',
              maskSize: 'contain',
              WebkitMaskRepeat: 'no-repeat',
              maskRepeat: 'no-repeat',
              WebkitMaskPosition: 'left',
              maskPosition: 'left'
            }} 
          />
        </div>
        
        {/* Navbar tabs - visible when scrolled */}
        <div className={`ml-6 flex gap-1 bg-muted/50 rounded-full p-1 transition-all duration-300 ${
          scrolled ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'
        }`}>
          <TabButtons />
        </div>
      </nav>
      
      {/* Hero Section */}
      <section className="min-h-screen px-6 items-center justify-center flex flex-col">
        {/* Hero tabs - visible initially, hidden when scrolled */}
        <div className={`flex gap-1 bg-muted/50 rounded-full p-1 mb-8 transition-all duration-300 ${
          scrolled ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
        }`}>
          <TabButtons />
        </div>
        
        <div className="relative z-10 flex flex-col items-center gap-8 animate-fade-in-up">
          <p className="text-lg text-center whitespace-nowrap animate-fade-in-delayed w-full md:text-4xl font-bold text-muted font-montserrat">
            Human networks are the new distribution.
          </p>
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