export interface Competitor {
  id: string;
  name: string;
  websiteUrl: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

export interface CompetitorCreateRequest {
  name: string;
  websiteUrl: string;
  description?: string;
}
