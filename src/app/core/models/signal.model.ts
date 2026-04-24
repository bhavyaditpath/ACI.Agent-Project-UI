export interface Signal {
  id: string;
  competitorId: string;
  competitorName: string;
  agentType: string;
  signalType: string;
  title: string;
  description?: string;
  sourceUrl?: string;
  importanceScore: number;
  confidenceScore: number;
  occurredAt: string;
  createdAt: string;
}
