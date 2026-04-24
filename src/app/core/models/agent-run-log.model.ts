export interface AgentRunLog {
  id: string;
  competitorId: string;
  competitorName: string;
  agentType: string;
  status: string;
  startedAt: string;
  completedAt?: string;
  errorMessage?: string;
  signalsCollected: number;
}
