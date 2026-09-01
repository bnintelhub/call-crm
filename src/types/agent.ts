export type AgentRoleType = 'CALL' | 'FIELD';

export interface AgentItem {
  id: string;
  agentName: string;
  supervisor: string;
  bnId: string;
  dra: 'Yes' | 'No';
  area: string;
  basePincode: string;
  residencePincode: string;
  currentAddress: string;
  permanentAddress: string;
  experience: string;
  campaign: string;
  acr: string;
  type: AgentRoleType;
  isOnline: boolean;
  isAllocated: boolean;
}

export type AgentTabType = 'ALL' | 'FIELD' | 'CALL';

export interface AgentGroupMappingItem {
  id: string;
  name: string;
  agentsCount: number;
  collections: string;
  campaign: string;
  status?: string;
  type: 'GROUP' | 'UNGROUPED';
}

export interface OnboardAgentPayload {
  agentName: string;
  supervisor?: string;
  bnId?: string;
  dra?: 'Yes' | 'No';
  area?: string;
  basePincode?: string;
  residencePincode?: string;
  currentAddress?: string;
  permanentAddress?: string;
  experience?: string;
  campaign?: string;
  acr?: string;
  type?: AgentRoleType;
}
