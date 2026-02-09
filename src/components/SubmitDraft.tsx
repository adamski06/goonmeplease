import React, { useState, useRef } from 'react';
import { ChevronLeft, Film, Upload, X } from 'lucide-react';
import { Campaign } from '@/data/campaigns';

interface SubmitDraftProps {
  campaign: Campaign;
  onBack: () => void;
}

const SubmitDraft: React.FC<SubmitDraftProps> = ({ campaign, onBack }) => {
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedVideo(file);
      const url = URL.createObjectURL(file);
      setVideoPreview(url);
    }
  };

  const handleRemoveVideo = () => {
    setSelectedVideo(null);
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
      setVideoPreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden relative" onClick={(e) => e.stopPropagation()}>
      {/* Header */}
      <div className="flex items-center px-5 pt-5 pb-3 border-b border-black/10 flex-shrink-0">
        <button onClick={onBack} className="p-1 -ml-1">
          <ChevronLeft className="h-5 w-5 text-black/60" />
        </button>
        <div className="flex items-center gap-2 flex-1 justify-center pr-6">
          <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
            <img src={campaign.logo} alt={campaign.brand} className="w-full h-full object-cover" />
          </div>
          <h2 className="text-sm font-bold text-black font-montserrat">Submit draft</h2>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {/* Video upload area */}
        <div className="mb-5">
          <h3 className="text-sm font-semibold text-black mb-3 font-montserrat">Your video</h3>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {!selectedVideo ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-[9/14] rounded-2xl flex flex-col items-center justify-center gap-3 transition-all active:scale-[0.98]"
              style={{
                background: 'linear-gradient(180deg, rgba(0,0,0,0.03) 0%, rgba(0,0,0,0.06) 100%)',
                border: '2px dashed rgba(0,0,0,0.15)',
              }}
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(180deg, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.08) 100%)',
                  border: '1px solid rgba(0,0,0,0.06)',
                }}
              >
                <Film className="h-6 w-6 text-black/40" strokeWidth={1.5} />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-black/60 font-montserrat">Choose from library</p>
                <p className="text-xs text-black/40 font-jakarta mt-1">MP4, MOV • Max 3 min</p>
              </div>
            </button>
          ) : (
            <div className="relative w-full aspect-[9/14] rounded-2xl overflow-hidden">
              <video
                src={videoPreview || undefined}
                className="w-full h-full object-cover"
                controls
              />
              <button
                onClick={handleRemoveVideo}
                className="absolute top-3 right-3 h-8 w-8 rounded-full flex items-center justify-center"
                style={{
                  background: 'rgba(0,0,0,0.6)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <X className="h-4 w-4 text-white" />
              </button>
            </div>
          )}
        </div>

        {/* Requirements */}
        <div
          className="rounded-xl p-4 mb-4"
          style={{
            background: 'linear-gradient(180deg, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.08) 100%)',
            border: '1px solid rgba(0,0,0,0.06)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5), 0 2px 8px rgba(0,0,0,0.04)',
          }}
        >
          <h3 className="text-sm font-semibold text-black mb-2 font-montserrat">Video requirements</h3>
          <ul className="space-y-1.5">
            {campaign.guidelines.map((guideline, idx) => (
              <li key={idx} className="text-sm text-black/80 font-jakarta flex items-start gap-2">
                <span className="text-black/40">•</span>
                {guideline}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Submit button */}
      <div className="px-5 py-5 flex-shrink-0">
        <button
          disabled={!selectedVideo}
          className="w-full py-4 rounded-full text-base font-bold font-montserrat transition-all active:scale-[0.97] disabled:opacity-40 disabled:active:scale-100"
          style={{
            background: 'linear-gradient(180deg, rgba(30,30,30,1) 0%, rgba(10,10,10,1) 100%)',
            border: '1.5px solid rgba(60,60,60,0.6)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.1)',
            color: 'white',
          }}
        >
          <span className="flex items-center justify-center gap-2">
            <Upload className="h-4 w-4" />
            Submit draft
          </span>
        </button>
      </div>
    </div>
  );
};

export default SubmitDraft;
