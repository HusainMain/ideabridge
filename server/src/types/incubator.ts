export interface Incubator {
  id: string;
  name: string;
  country: string;
  region: string;
  acceptsInternational: boolean;
  industries: string[];
  startupStages: string[];
  remote: boolean;
  funding: string;
  equity: string | null;
  website: string;
  description: string;
  tags: string[];
}

export interface IncubatorRecommendation {
  id: string;
  name: string;
  matchPercent: number;
  description: string;
  funding: string;
  equity: string | null;
  startupStages: string[];
  industries: string[];
  country: string;
  acceptsInternational: boolean;
  remote: boolean;
  website: string;
  matchReason: string;
}
