export type AgentDateRangeType = 'Last7Days' | 'Last30Days' | 'Custom';

export interface AgentRunRequest {
  dateRangeType: AgentDateRangeType;
  fromDate?: string;
  toDate?: string;
}