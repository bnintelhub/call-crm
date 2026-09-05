export interface ProductOption {
  id: string;
  label: string;
  category?: string;
}

export interface BucketOption {
  id: string;
  label: string;
  dpdRange?: string;
}

export const PRODUCT_OPTIONS: ProductOption[] = [
  { id: 'agri-loan', label: 'Agri Loan', category: 'Rural' },
  { id: 'auto-loan', label: 'Auto Loan', category: 'Vehicles' },
  { id: 'business-loan', label: 'Business Loan', category: 'Commercial' },
  { id: 'casa', label: 'CASA', category: 'Banking' },
  { id: 'commercial-business', label: 'Commercial Business', category: 'Commercial' },
  { id: 'commercial-vehicle', label: 'Commercial Vehicle', category: 'Vehicles' },
  { id: 'credit-card', label: 'Credit Card', category: 'Unsecured' },
  { id: 'gold-loan', label: 'Gold Loan', category: 'Secured' },
  { id: 'home-loan', label: 'Home Loan', category: 'Secured' },
  { id: 'mortgage', label: 'Mortgage', category: 'Secured' },
  { id: 'personal-loan', label: 'Personal Loan', category: 'Unsecured' },
  { id: 'sme-loan', label: 'SME Loan', category: 'Commercial' },
];

export const BUCKET_OPTIONS: BucketOption[] = [
  { id: 'pre-due', label: 'Pre Due', dpdRange: '0 DPD' },
  { id: 'bucket-1', label: 'Bucket 1', dpdRange: '1-30 DPD' },
  { id: 'npa', label: 'NPA', dpdRange: '90+ DPD' },
  { id: 'post-due', label: 'Post Due', dpdRange: 'Grace Period' },
  { id: 'bucket-2', label: 'Bucket 2', dpdRange: '31-60 DPD' },
  { id: 'bucket-3', label: 'Bucket 3', dpdRange: '61-90 DPD' },
  { id: 'bucket-4', label: 'Bucket 4', dpdRange: '91-120 DPD' },
  { id: 'writeoff', label: 'Writeoff', dpdRange: '180+ DPD' },
  { id: 'bucket-5', label: 'Bucket 5', dpdRange: '121-180 DPD' },
  { id: 'nilpos', label: 'NILPOS', dpdRange: 'Settled' },
];
