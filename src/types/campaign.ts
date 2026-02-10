export interface CampaignTier {
  minViews: number;
  maxViews: number | null;
  rate: number;
}

export interface Campaign {
  id: string;
  brand: string;
  title: string;
  description: string;
  maxEarnings: number;
  logo: string;
  image: string;
  contentType: string;
  productVisibility: string;
  videoLength: string;
  guidelines: string[];
  tiers: CampaignTier[];
  exampleImages?: string[];
  pot?: number;
}
