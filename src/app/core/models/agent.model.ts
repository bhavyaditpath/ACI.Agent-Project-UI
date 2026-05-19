export type AgentDateRangeType = 'Last7Days' | 'Last30Days' | 'Custom';

export interface AgentRunRequest {
  dateRangeType: AgentDateRangeType;
  fromDate?: string;
  toDate?: string;
}

export interface AgentConfiguration {
  id: string;
  competitorId: string;
  agentType: string;
  isEnabled: boolean;
  agentDescription: string;
  updatedAt: string;
}

export interface UpdateAgentConfigurationRequest {
  agentType: string;
  isEnabled: boolean;
}