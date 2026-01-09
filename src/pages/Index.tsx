import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import jarlaLogo from "@/assets/jarla-logo.png";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const Index = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="overflow-x-hidden relative">
      {/* Static Grainy Background */}
      <div className="fixed inset-0 grainy-background" />
      <div className="noise-layer fixed" />
      
      {/* Fixed Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
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
          
          {/* Nav buttons */}
          <button className="ml-8 px-4 pt-1 pb-[7px] text-sm font-bold font-montserrat text-foreground hover:opacity-80 transition-opacity">
            {t('nav.pricing')}
          </button>
          <button className="px-4 pt-1 pb-[7px] text-sm font-bold font-montserrat text-foreground hover:opacity-80 transition-opacity">
            {t('nav.aboutUs')}
          </button>
          <button className="px-4 pt-1 pb-[7px] text-sm font-bold font-montserrat text-foreground hover:opacity-80 transition-opacity">
            {t('nav.careers')}
          </button>
          
          {/* Right side */}
          <div className="ml-auto flex items-center gap-4">
            <LanguageSwitcher variant="minimal" />
            <button 
              onClick={() => navigate('/business/auth?mode=login')}
              className="px-6 py-2 text-base font-bold font-montserrat text-foreground hover:opacity-80 transition-opacity"
            >
              {t('nav.login')}
            </button>
            <button 
              onClick={() => navigate('/business/auth')}
              className="px-6 py-2 text-base font-bold font-montserrat bg-foreground text-background rounded-full transition-all duration-300 hover:opacity-90"
            >
              {t('landing.getStarted')}
            </button>
          </div>
        </div>
      </nav>
      
      {/* Hero Section */}
      <section className="min-h-screen px-6 flex flex-col relative">
        <div className="flex-1 flex items-center max-w-7xl mx-auto w-full justify-center">
          <div className="relative z-10 flex flex-col gap-8 animate-fade-in-up w-full items-center">
            <h1 className="animate-fade-in-delayed font-bold text-foreground font-montserrat text-center">
              <div className="mt-80">
                <span className="block text-4xl md:text-6xl">{t('landing.businessHero.title1')}</span>
                <span className="block text-4xl md:text-6xl">{t('landing.businessHero.title2')}</span>
                <div className="flex justify-center mt-8">
                  <button 
                    onClick={() => navigate('/business/auth')}
                    className="px-12 py-4 text-xl font-bold font-montserrat bg-foreground text-background rounded-full transition-all duration-300 hover:opacity-90"
                  >
                    {t('landing.getStarted')}
                  </button>
                </div>
              </div>
            </h1>
          </div>
        </div>
      </section>

      {/* Section 2 */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 relative z-10">
        <div className="max-w-2xl text-center">
          <h2 className="text-4xl md:text-6xl font-semibold text-foreground mb-6">
            {t('landing.sectionTwo')}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t('landing.addContent')}
          </p>
        </div>
      </section>

      {/* Section 3 */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 relative z-10">
        <div className="max-w-2xl text-center">
          <h2 className="text-4xl md:text-6xl font-semibold text-foreground mb-6">
            {t('landing.sectionThree')}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t('landing.addContent')}
          </p>
        </div>
      </section>
    </div>
  );
};

export default Index;