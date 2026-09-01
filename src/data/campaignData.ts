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
}

export const initialCampaignsData: CampaignItem[] = [
  {
    id: 'camp-1',
    name: 'Kalyani Kumari',
    category: 'PREDICTIVE',
    borrowerCount: 0,
    leftOutBorrower: 0,
    contactability: 0,
    agentsCount: 1,
    completedAutodial: 3,
    status: 'Running',
    createdAt: '2026-08-31',
  },
  {
    id: 'camp-2',
    name: 'demo_npa',
    category: 'PREDICTIVE',
    borrowerCount: 0,
    leftOutBorrower: 0,
    contactability: 0,
    agentsCount: 2,
    completedAutodial: 0,
    status: 'Paused',
    createdAt: '2026-08-30',
  },
  {
    id: 'camp-3',
    name: 'Money_new_x_p',
    category: 'PREDICTIVE',
    borrowerCount: 0,
    leftOutBorrower: 0,
    contactability: 0,
    agentsCount: 1,
    completedAutodial: 4,
    status: 'Paused',
    createdAt: '2026-08-28',
  },
  {
    id: 'camp-4',
    name: 'Moneyview_NPA',
    category: 'PREDICTIVE',
    borrowerCount: 0,
    leftOutBorrower: 0,
    contactability: 0,
    agentsCount: 10,
    completedAutodial: 6,
    status: 'Paused',
    createdAt: '2026-08-25',
  },
  {
    id: 'camp-5',
    name: 'money_demo',
    category: 'PREDICTIVE',
    borrowerCount: 0,
    leftOutBorrower: 0,
    contactability: 0,
    agentsCount: 0,
    completedAutodial: 0,
    status: 'Paused',
    createdAt: '2026-08-20',
  },
  {
    id: 'camp-6',
    name: 'Demo',
    category: 'MANUAL',
    borrowerCount: 0,
    leftOutBorrower: 0,
    contactability: 0,
    agentsCount: 2,
    completedAutodial: 0,
    status: 'Paused',
    createdAt: '2026-08-15',
  },
];
