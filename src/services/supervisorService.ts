import { userApi, allocationApi, campaignApi, reportApi, uploadApi, loanApi } from './api';

export const supervisorService = {
  // Agent Management
  getAgents: (params?: Record<string, string>) => userApi.list(params),
  createAgent: (data: any) => userApi.create(data),
  updateAgent: (id: string, data: any) => userApi.update(id, data),
  deleteAgent: (id: string) => userApi.delete(id),
  getTelecallers: () => userApi.getTelecallers(),

  // Allocations
  getAllocatedData: (params?: Record<string, string>) => allocationApi.getAllocatedData(params),
  getSummaryReport: (params?: Record<string, string>) => allocationApi.getSummaryReport(params),
  allocateLoans: (loanRecordIds: string[], allocations: { telecallerId: string; count: number }[]) =>
    allocationApi.allocate(loanRecordIds, allocations),
  unallocateLoans: (loanRecordIds: string[]) => allocationApi.unallocate(loanRecordIds),
  getAllocationHistory: () => allocationApi.history(),
  uploadAllocationFile: (file: File, companyId: string, columnMappings?: Record<string, string>, templateId?: string) =>
    uploadApi.bulkUpload(file, companyId, columnMappings, templateId),

  // Campaigns
  getCampaigns: () => campaignApi.list(),
  getCampaignDetails: (id: string) => campaignApi.details(id),
  createCampaign: (data: any) => campaignApi.create(data),
  launchCampaign: (id: string) => campaignApi.launch(id),
  deleteCampaign: (id: string) => campaignApi.delete(id),

  // Reports & Analytics
  getDashboardStats: () => reportApi.dashboard(),
  getTelecallerPerformance: () => reportApi.telecallerPerformance(),
  getTeamDetailedStats: () => reportApi.teamDetailedStats(),
  getDpdBreakdown: () => reportApi.dpdBreakdown(),
  getCompanyStats: () => reportApi.companyStats(),
  getCallTrend: () => reportApi.callTrend(),
};

export default supervisorService;
