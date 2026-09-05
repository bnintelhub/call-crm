export type CampaignStatus = 'Live' | 'Assigned' | 'Draft' | 'Paused' | 'Completed';

export interface CampaignItem {
  id: string;
  campaignName: string;
  category: string;
  startDate: string;
  endDate: string;
  allocationDate: string;
  totalLeads: number;
  assignedAgents: number;
  status: CampaignStatus;
  pos: string;
  dialerType?: string;
  description?: string;
}

export type CampaignCategoryTab = 'ALL' | 'TWO_WHEELER' | 'PERSONAL_LOAN' | 'AUTO_LOAN' | 'CREDIT_CARD';

export interface CampaignStatsData {
  totalCampaigns: number;
  liveCampaigns: number;
  assignedCampaigns: number;
  totalAllocations: number;
}
