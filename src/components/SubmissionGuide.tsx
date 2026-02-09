import React, { useState } from 'react';
import { ChevronLeft, Video, Upload, CheckCircle } from 'lucide-react';
import { Campaign } from '@/data/campaigns';

interface SubmissionGuideProps {
  campaign: Campaign;
  onBack: () => void;
}

const steps = [
  {
    number: 1,
    title: 'Create your video',
    description: 'Record a TikTok video following the campaign guidelines. Make sure the product is clearly visible and your content feels authentic.',
    icon: Video,
  },
  {
    number: 2,
    title: 'Post on TikTok',
    description: 'Upload the video to your TikTok account. Use the required hashtags and tag the brand if specified in the guidelines.',
    icon: Upload,
  },
  {
    number: 3,
    title: 'Submit your link',
    description: 'Paste your TikTok video link here. We\'ll review your content and start tracking views once approved.',
    icon: CheckCircle,
  },
];

const SubmissionGuide: React.FC<SubmissionGuideProps> = ({ campaign, onBack }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [sliding, setSliding] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'forward' | 'back'>('forward');

  const goToStep = (nextStep: number) => {
    if (nextStep === currentStep || sliding) return;
    setSlideDirection(nextStep > currentStep ? 'forward' : 'back');
    setSliding(true);
    setTimeout(() => {
      setCurrentStep(nextStep);
      setSliding(false);
    }, 300);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden relative" onClick={(e) => e.stopPropagation()}>
      {/* Header */}
      <div className="flex items-center px-5 pt-5 pb-3 border-b border-black/10 flex-shrink-0">
        <button onClick={currentStep === 0 ? onBack : () => goToStep(currentStep - 1)} className="p-1 -ml-1">
          <ChevronLeft className="h-5 w-5 text-black/60" />
        </button>
        <div className="flex items-center gap-2 flex-1 justify-center pr-6">
          <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
            <img src={campaign.logo} alt={campaign.brand} className="w-full h-full object-cover" />
          </div>
          <h2 className="text-sm font-bold text-black font-montserrat">How it works</h2>
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-2 px-5 pt-4 pb-2 flex-shrink-0">
        {steps.map((_, idx) => (
          <div
            key={idx}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{
              background: idx <= currentStep ? 'black' : 'rgba(0,0,0,0.1)',
            }}
          />
        ))}
      </div>

      {/* Steps content with swipe */}
      <div className="flex-1 relative overflow-hidden">
        {steps.map((step, idx) => {
          const isActive = idx === currentStep;
          const isPrev = idx < currentStep;

          let transform = 'translateX(100%)';
          let opacity = 0;

          if (isActive && !sliding) {
            transform = 'translateX(0)';
            opacity = 1;
          } else if (isActive && sliding) {
            transform = slideDirection === 'forward' ? 'translateX(-100%)' : 'translateX(100%)';
            opacity = 0;
          } else if (isPrev) {
            transform = 'translateX(-100%)';
            opacity = 0;
          }

          // The next step sliding in
          if (sliding && idx === (slideDirection === 'forward' ? currentStep + 1 : currentStep - 1)) {
            // This is a placeholder — handled by the timeout transition
          }

          // Show the incoming step
          const isIncoming = sliding && (
            (slideDirection === 'forward' && idx === currentStep + 1) ||
            (slideDirection === 'back' && idx === currentStep - 1)
          );

          if (isIncoming) {
            transform = slideDirection === 'forward' ? 'translateX(0)' : 'translateX(0)';
            opacity = 1;
          }

          return (
            <div
              key={idx}
              className="absolute inset-0 flex flex-col items-center justify-center px-8"
              style={{
                transform,
                opacity,
                transition: sliding ? 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.3s ease' : 'none',
                pointerEvents: isActive && !sliding ? 'auto' : 'none',
              }}
            >
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
                style={{
                  background: 'linear-gradient(180deg, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.08) 100%)',
                  border: '1px solid rgba(0,0,0,0.06)',
                }}
              >
                <step.icon className="h-8 w-8 text-black/70" strokeWidth={1.5} />
              </div>
              <div className="text-center">
                <p className="text-xs text-black/40 font-montserrat font-semibold uppercase tracking-wider mb-2">
                  Step {step.number}
                </p>
                <h3 className="text-xl font-bold text-black font-montserrat mb-3">
                  {step.title}
                </h3>
                <p className="text-sm text-black/60 font-jakarta leading-relaxed max-w-[280px]">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA at bottom */}
      <div className="px-5 py-5 flex-shrink-0">
        {currentStep < steps.length - 1 ? (
          <button
            onClick={() => goToStep(currentStep + 1)}
            className="w-full py-4 rounded-full text-base font-bold font-montserrat transition-all active:scale-[0.97]"
            style={{
              background: 'linear-gradient(180deg, rgba(30,30,30,1) 0%, rgba(10,10,10,1) 100%)',
              border: '1.5px solid rgba(60,60,60,0.6)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.1)',
              color: 'white',
            }}
          >
            Next
          </button>
        ) : (
          <button
            className="w-full py-4 rounded-full text-base font-bold font-montserrat transition-all active:scale-[0.97]"
            style={{
              background: 'linear-gradient(180deg, rgba(30,30,30,1) 0%, rgba(10,10,10,1) 100%)',
              border: '1.5px solid rgba(60,60,60,0.6)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.1)',
              color: 'white',
            }}
          >
            Submit your TikTok link
          </button>
        )}
      </div>
    </div>
  );
};

export default SubmissionGuide;
