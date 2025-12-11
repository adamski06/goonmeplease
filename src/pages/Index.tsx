const Index = () => {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-aurora px-6">
      {/* Subtle noise texture */}
      <div className="noise-layer" />
      
      <div className="relative z-10 flex flex-col items-center gap-8 animate-fade-in-up">
        {/* Logo placeholder - replace with your actual logo */}
        <div className="flex items-center justify-center">
          <h1 className="text-7xl md:text-9xl lg:text-[10rem] font-semibold tracking-tight text-foreground">
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
