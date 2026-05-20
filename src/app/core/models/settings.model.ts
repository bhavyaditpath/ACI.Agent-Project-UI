export interface GlobalAgentDefaultResponse {
  id: string;
  agentType: string;
  isEnabledByDefault: boolean;
  agentDescription: string;
  agentIcon: string;
  updatedByUserName: string;
  updatedAt: string;
}

export interface UpdateGlobalAgentDefaultRequest {
  agentType: string;
  isEnabledByDefault: boolean;
}

export interface UpdateAllGlobalDefaultsRequest {
  agents: UpdateGlobalAgentDefaultRequest[];
}