const Index = () => {
  return (
    <div className="bg-gradient-aurora">
      {/* Subtle noise texture */}
      <div className="noise-layer" />
      
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6">
        <div className="relative z-10 flex flex-col items-center gap-8 animate-fade-in-up">
          <div className="flex items-center justify-center">
            <h1 className="text-7xl md:text-9xl lg:text-[10rem] font-semibold tracking-tight text-foreground">
              Jarla
            </h1>
          </div>
          
          <p className="text-lg md:text-xl text-muted-foreground text-center max-w-md animate-fade-in-delayed">
            Your app, simplified.
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
    </div>
  );
};

export default Index;
