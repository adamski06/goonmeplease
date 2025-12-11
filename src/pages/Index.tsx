import jarlaLogo from "@/assets/jarla-logo.png";
const Index = () => {
  return <div className="bg-gradient-aurora">
      {/* Subtle noise texture */}
      <div className="noise-layer" />
      
      {/* Hero Section */}
      <section className="min-h-screen px-6 items-center justify-center flex flex-col">
        <div className="relative z-10 flex flex-col items-center gap-8 animate-fade-in-up">
          <div className="flex items-center justify-center relative">
            {/* Main logo */}
            <div className="h-24 md:h-32 lg:h-40 w-[400px] md:w-[500px] lg:w-[600px] logo-glass" style={{
            WebkitMaskImage: `url(${jarlaLogo})`,
            maskImage: `url(${jarlaLogo})`,
            WebkitMaskSize: 'contain',
            maskSize: 'contain',
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            maskPosition: 'center'
          }} />
          </div>
          
          <p className="text-lg text-center whitespace-nowrap animate-fade-in-delayed w-full md:text-4xl font-bold text-muted">
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