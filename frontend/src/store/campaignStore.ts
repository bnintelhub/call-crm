import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { initialCampaignsData, type CampaignItem } from '../data/campaignData';
import type { AllocationItem } from '../data/allocationData';

/**
 * Format campaign name following standard convention:
 * `company name_product_bucket_year_date`
 * e.g., "Moneyview_Personal Loan_Fresh_2026_09-01"
 */
export const generateCampaignName = (
  company: string = 'Moneyview',
  product: string = 'Personal Loan',
  bucket: string = 'Fresh',
  dateInput?: string | Date
): string => {
  const d = dateInput ? new Date(dateInput) : new Date();
  const validDate = isNaN(d.getTime()) ? new Date() : d;

  const year = validDate.getFullYear();
  const month = String(validDate.getMonth() + 1).padStart(2, '0');
  const day = String(validDate.getDate()).padStart(2, '0');

  const cleanCompany = (company || 'Moneyview').trim();
  const cleanProduct = (product || 'Personal Loan').trim();
  const cleanBucket = (bucket || 'Fresh').trim();

  // Naming format: company name_product_bucket_year_date
  return `${cleanCompany}_${cleanProduct}_${cleanBucket}_${year}_${month}-${day}`;
};

interface CampaignState {
  campaignsList: CampaignItem[];
  addCampaign: (campaign: Partial<CampaignItem> & { name: string }) => CampaignItem;
  addCampaignFromAllocation: (allocation: AllocationItem, companyName?: string) => CampaignItem;
  updateCampaign: (id: string, updates: Partial<CampaignItem>) => void;
  deleteCampaign: (id: string) => void;
  resetToDefaults: () => void;
}

export const useCampaignStore = create<CampaignState>()(
  persist(
    (set, get) => ({
      campaignsList: initialCampaignsData,

      addCampaign: (campaignData) => {
        const id = campaignData.id || `camp-${Date.now()}`;
        const newCampaign: CampaignItem = {
          id,
          name: campaignData.name.trim(),
          category: campaignData.category || 'PREDICTIVE',
          borrowerCount: campaignData.borrowerCount ?? 0,
          leftOutBorrower: campaignData.leftOutBorrower ?? 0,
          contactability: campaignData.contactability ?? 0,
          agentsCount: campaignData.agentsCount ?? 1,
          completedAutodial: campaignData.completedAutodial ?? 0,
          status: campaignData.status || 'Running',
          createdAt: campaignData.createdAt || new Date().toISOString().split('T')[0],
          strategy: campaignData.strategy || 'High Velocity Ratio 3:1',
          targetQueue: campaignData.targetQueue || 'Tier-1 Overdue',
          allocationId: campaignData.allocationId,
        };

        set((state) => ({
          campaignsList: [newCampaign, ...state.campaignsList],
        }));

        return newCampaign;
      },

      addCampaignFromAllocation: (allocation: AllocationItem, companyName: string = 'Moneyview') => {
        const id = `camp-${allocation.id}`;
        
        // Campaign name format: company name_product_bucket_year_date
        const formattedCampaignName = generateCampaignName(
          companyName,
          allocation.product,
          allocation.buckets,
          new Date()
        );

        // Check if already exists
        const existing = get().campaignsList.find((c) => c.allocationId === allocation.id || c.name === formattedCampaignName);
        if (existing) {
          return existing;
        }

        const newCampaign: CampaignItem = {
          id,
          name: formattedCampaignName, // company name_product_bucket_year_date
          category: 'PREDICTIVE',
          borrowerCount: allocation.caseCounts || 120,
          leftOutBorrower: allocation.caseCounts || 120,
          contactability: 0,
          agentsCount: 0,
          completedAutodial: 0,
          status: 'Paused', // Unallocated / Ready to launch
          createdAt: new Date().toISOString().split('T')[0],
          strategy: 'Auto-Dialer Standard',
          targetQueue: `${allocation.product} - ${allocation.buckets}`,
          allocationId: allocation.id,
        };

        set((state) => ({
          campaignsList: [newCampaign, ...state.campaignsList],
        }));

        return newCampaign;
      },

      updateCampaign: (id, updates) => {
        set((state) => ({
          campaignsList: state.campaignsList.map((camp) =>
            camp.id === id ? { ...camp, ...updates } : camp
          ),
        }));
      },

      deleteCampaign: (id) => {
        set((state) => ({
          campaignsList: state.campaignsList.filter((camp) => camp.id !== id),
        }));
      },

      resetToDefaults: () => {
        set({ campaignsList: initialCampaignsData });
      },
    }),
    {
      name: 'design-crm-campaign-store',
    }
  )
);

export default useCampaignStore;
