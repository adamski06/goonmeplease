import { useState } from "react";
import jarlaLogo from "@/assets/jarla-logo.png";

const Index = () => {
  const [activeTab, setActiveTab] = useState<'creator' | 'business'>('creator');

  const TabButtons = () => (
    <>
      <button
        onClick={() => setActiveTab('creator')}
        className={`px-6 py-2 rounded-full text-sm font-bold font-montserrat transition-all duration-300 ${
          activeTab === 'creator' 
            ? 'bg-white text-black' 
            : 'text-white hover:text-white/80'
        }`}
      >
        Creator
      </button>
      <button
        onClick={() => setActiveTab('business')}
        className={`px-6 py-2 rounded-full text-sm font-bold font-montserrat transition-all duration-300 ${
          activeTab === 'business' 
            ? 'bg-white text-black' 
            : 'text-white hover:text-white/80'
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
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center gap-4 after:absolute after:inset-x-0 after:top-0 after:h-32 after:bg-gradient-to-b after:from-black/20 after:via-black/10 after:to-transparent after:-z-10 after:pointer-events-none after:animate-fade-in">
        <div className="relative h-8 md:h-10 w-[120px] md:w-[150px]">
          <div 
            className="absolute inset-0 bg-white animate-fade-in"
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
        
        {/* Tabs next to logo */}
        <div className="flex border-[5px] border-white rounded-full animate-fade-in overflow-hidden">
          <TabButtons />
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