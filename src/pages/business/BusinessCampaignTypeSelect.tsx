import { useNavigate } from "react-router-dom";
import BusinessLayout from "@/components/BusinessLayout";

const BusinessCampaignTypeSelect = () => {
  const navigate = useNavigate();

  const handleSelectType = (type: "simple" | "guided") => {
    navigate(`/business/campaigns/new/form?type=${type}`);
  };

  return (
    <BusinessLayout>
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-6">
        <h1 className="text-3xl font-bold mb-2">Create Campaign</h1>
        <p className="text-muted-foreground mb-12">Choose your campaign type</p>
        
        <div className="flex gap-8 md:gap-12">
          {/* Simple Campaign */}
          <button
            onClick={() => handleSelectType("simple")}
            className="group flex flex-col items-center"
          >
            <div className="w-48 md:w-56 aspect-[9/16] bg-muted border-2 border-border rounded-2xl flex items-center justify-center transition-all group-hover:border-primary group-hover:bg-muted/80 group-hover:scale-[1.02]">
              <span className="text-6xl text-muted-foreground/50 group-hover:text-primary/50 transition-colors">▶</span>
            </div>
            <h2 className="mt-4 text-xl font-semibold group-hover:text-primary transition-colors">Simple</h2>
            <p className="text-sm text-muted-foreground mt-1 text-center max-w-[180px]">
              Any creator can participate
            </p>
          </button>

          {/* Guided Campaign */}
          <button
            onClick={() => handleSelectType("guided")}
            className="group flex flex-col items-center"
          >
            <div className="w-48 md:w-56 aspect-[9/16] bg-muted border-2 border-border rounded-2xl flex items-center justify-center transition-all group-hover:border-primary group-hover:bg-muted/80 group-hover:scale-[1.02]">
              <span className="text-6xl text-muted-foreground/50 group-hover:text-primary/50 transition-colors">▶</span>
            </div>
            <h2 className="mt-4 text-xl font-semibold group-hover:text-primary transition-colors">Guided</h2>
            <p className="text-sm text-muted-foreground mt-1 text-center max-w-[180px]">
              Invite specific creators
            </p>
          </button>
        </div>
      </div>
    </BusinessLayout>
  );
};

export default BusinessCampaignTypeSelect;
