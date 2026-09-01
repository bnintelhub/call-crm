export interface CampaignItem {
  id: string;
  name: string;
  category: 'PREDICTIVE' | 'MANUAL' | 'PROGRESSIVE' | 'PREVIEW';
  borrowerCount: number;
  leftOutBorrower: number;
  contactability: number;
  agentsCount: number;
  completedAutodial: number;
  status: 'Running' | 'Paused' | 'Completed';
  createdAt?: string;
  strategy?: string;
  targetQueue?: string;
  allocationId?: string;
}

export const initialCampaignsData: CampaignItem[] = [
  {
    id: 'camp-1',
    name: 'Kalyani Kumari_Personal Loan_Recovery_2026_08-31',
    category: 'PREDICTIVE',
    borrowerCount: 420,
    leftOutBorrower: 18,
    contactability: 68,
    agentsCount: 1,
    completedAutodial: 3,
    status: 'Running',
    createdAt: '2026-08-31',
    strategy: 'High Velocity Ratio 3:1',
    targetQueue: 'Tier-1 Overdue',
  },
  {
    id: 'camp-2',
    name: 'Moneyview_Personal Loan_NPA_2026_08-30',
    category: 'PREDICTIVE',
    borrowerCount: 680,
    leftOutBorrower: 45,
    contactability: 54,
    agentsCount: 2,
    completedAutodial: 0,
    status: 'Paused',
    createdAt: '2026-08-30',
    strategy: 'Predictive Fast Pace',
    targetQueue: 'NPA Stage 2',
  },
  {
    id: 'camp-3',
    name: 'Moneyview_Personal Loan_Fresh_2026_08-28',
    category: 'PREDICTIVE',
    borrowerCount: 512,
    leftOutBorrower: 120,
    contactability: 62,
    agentsCount: 1,
    completedAutodial: 4,
    status: 'Paused',
    createdAt: '2026-08-28',
    strategy: 'Progressive 1:1 Flow',
    targetQueue: 'Fresh Allotment',
  },
  {
    id: 'camp-4',
    name: 'Moneyview_Personal Loan_Pre Due_2026_08-25',
    category: 'PREDICTIVE',
    borrowerCount: 320,
    leftOutBorrower: 0,
    contactability: 81,
    agentsCount: 10,
    completedAutodial: 6,
    status: 'Paused',
    createdAt: '2026-08-25',
    strategy: 'Early Courtesy Reminder',
    targetQueue: 'VIP Collections',
  },
  {
    id: 'camp-5',
    name: 'Moneyview_Credit Line_DPD 31-60_2026_08-20',
    category: 'PREDICTIVE',
    borrowerCount: 240,
    leftOutBorrower: 80,
    contactability: 45,
    agentsCount: 0,
    completedAutodial: 0,
    status: 'Paused',
    createdAt: '2026-08-20',
    strategy: 'Standard Recovery Pace',
    targetQueue: 'Bucket 1 Soft Reminders',
  },
  {
    id: 'camp-6',
    name: 'Moneyview_Personal Loan_Fresh_2026_08-15',
    category: 'MANUAL',
    borrowerCount: 160,
    leftOutBorrower: 40,
    contactability: 72,
    agentsCount: 2,
    completedAutodial: 0,
    status: 'Paused',
    createdAt: '2026-08-15',
    strategy: 'Manual Verification Queue',
    targetQueue: 'Tier-1 Overdue',
  },
];
