const Index = () => {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-aurora noise-overlay px-6">
      {/* Aurora color layers */}
      <div className="aurora-layer aurora-cyan" />
      <div className="aurora-layer aurora-blue" />
      <div className="aurora-layer aurora-lilac" />
      <div className="aurora-layer aurora-pink" />
      <div className="aurora-layer aurora-orange" />
      
      <div className="relative z-10 flex flex-col items-center gap-8 animate-fade-in-up">
        {/* Logo placeholder - replace with your actual logo */}
        <div className="flex items-center justify-center">
          <h1 className="text-6xl md:text-8xl font-semibold tracking-tight text-foreground drop-shadow-sm">
            Jarla
          </h1>
        </div>
        
        {/* Optional tagline */}
        <p className="text-lg md:text-xl text-muted-foreground text-center max-w-md animate-fade-in-delayed">
          Your app, simplified.
        </p>
      </div>
    </main>
  );
};

export default Index;
