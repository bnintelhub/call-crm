import { z } from 'zod';

const stringField = z.union([z.string(), z.number(), z.boolean()]).transform(v => String(v));
const optionalStringField = z.union([z.string(), z.number(), z.boolean()]).transform(v => String(v)).optional().nullable();

const moneyField = z.preprocess((val) => {
  if (typeof val === 'string') {
    const parsed = parseFloat(val.replace(/[^\d.-]/g, ''));
    return isNaN(parsed) ? 0 : parsed;
  }
  return val === undefined || val === null || val === '' ? 0 : val;
}, z.coerce.number());

export const allocationRowSchema = z.object({
  loan_number: stringField.refine(val => val.length > 0, "Loan number is required"),
  borrower_name: stringField.refine(val => val.length > 0, "Borrower name is required"),
  phone_number: stringField.refine(val => val.length > 0, "Phone number is required"),
  phone_number_alt: optionalStringField,
  address: optionalStringField,
  district: optionalStringField,
  state: optionalStringField,
  pincode: optionalStringField,
  total_due_amount: moneyField,
  principal_outstanding: moneyField,
  dues_amount: moneyField,
  paid_amount: moneyField,
  remaining_amount: moneyField,
  emi_amount: moneyField,
  loan_amount: moneyField,
  tenure: z.coerce.number().optional().nullable(),
  payments_made: z.coerce.number().optional().nullable(),
  dpd_days: z.coerce.number().optional().default(0),
  dpd_category: optionalStringField,
  loan_type: optionalStringField,
  product_name: optionalStringField,
  channel: optionalStringField,
  email: optionalStringField,
  gender: optionalStringField,
  date_of_birth: optionalStringField,
  pan_number: optionalStringField,
  employer_name: optionalStringField,
  landmark: optionalStringField,
  disbursal_date: optionalStringField,
  last_paid_date: optionalStringField,
  last_paid_mode: optionalStringField,
  due_date: optionalStringField,
  dpd_bucket: optionalStringField,
  peak_category: optionalStringField,
  penalties: moneyField,
  emi_to_be_collected: moneyField,
  payment_link: optionalStringField,
  lending_partner: optionalStringField,
  paid_status: optionalStringField,
  lot_type: optionalStringField,
  allocation_team: optionalStringField,
  overdue_emis: z.coerce.number().optional().nullable(),
  loan_category: optionalStringField,
  zone: optionalStringField,
  cluster: optionalStringField,
  stab_forward: optionalStringField,
  last_paid_amount: moneyField,
  total_emi_paid: z.coerce.number().optional().nullable(),
  dq_string: optionalStringField,
  cohort_details: optionalStringField,
  first_cohort_flag: optionalStringField,
  overdue_amount: moneyField,
  allocation_status: z.preprocess((val) => {
    const valid = ['UNALLOCATED', 'ALLOCATED', 'IN_PROGRESS', 'COMPLETED'];
    if (typeof val === 'string' && valid.includes(val.toUpperCase())) {
      return val.toUpperCase();
    }
    return 'UNALLOCATED'; // Silently fallback instead of crashing
  }, z.enum(['UNALLOCATED', 'ALLOCATED', 'IN_PROGRESS', 'COMPLETED']).optional().default('UNALLOCATED')),
  company_id: optionalStringField,
  batch_id: optionalStringField,
  extra_data: optionalStringField,
});

export type AllocationRowData = z.infer<typeof allocationRowSchema>;

export interface SystemColumn {
  key: keyof AllocationRowData;
  label: string;
  required: boolean;
  category: string;
}

export const SYSTEM_COLUMNS: SystemColumn[] = [
  // Required Core Fields
  { key: 'loan_number', label: 'Loan Number', required: true, category: 'Core' },
  { key: 'borrower_name', label: 'Borrower Name', required: true, category: 'Core' },
  { key: 'phone_number', label: 'Phone Number', required: true, category: 'Core' },
  { key: 'total_due_amount', label: 'Total Due Amount', required: true, category: 'Financial' },
  { key: 'principal_outstanding', label: 'Principal Outstanding', required: true, category: 'Financial' },
  
  // Optional Core Fields
  { key: 'phone_number_alt', label: 'Alt Phone Number', required: false, category: 'Core' },
  { key: 'email', label: 'Email', required: false, category: 'Core' },
  { key: 'pan_number', label: 'PAN Number', required: false, category: 'Core' },
  { key: 'date_of_birth', label: 'Date of Birth', required: false, category: 'Core' },
  { key: 'gender', label: 'Gender', required: false, category: 'Core' },
  { key: 'employer_name', label: 'Employer Name', required: false, category: 'Core' },
  
  // Location
  { key: 'address', label: 'Address', required: false, category: 'Location' },
  { key: 'district', label: 'District', required: false, category: 'Location' },
  { key: 'state', label: 'State', required: false, category: 'Location' },
  { key: 'pincode', label: 'Pincode', required: false, category: 'Location' },
  { key: 'landmark', label: 'Landmark', required: false, category: 'Location' },
  
  // Financial
  { key: 'dues_amount', label: 'Dues Amount', required: false, category: 'Financial' },
  { key: 'paid_amount', label: 'Paid Amount', required: false, category: 'Financial' },
  { key: 'remaining_amount', label: 'Remaining Amount', required: false, category: 'Financial' },
  { key: 'emi_amount', label: 'EMI Amount', required: false, category: 'Financial' },
  { key: 'loan_amount', label: 'Loan Amount', required: false, category: 'Financial' },
  { key: 'penalties', label: 'Penalties', required: false, category: 'Financial' },
  { key: 'emi_to_be_collected', label: 'EMI to be Collected', required: false, category: 'Financial' },
  { key: 'last_paid_amount', label: 'Last Paid Amount', required: false, category: 'Financial' },
  { key: 'overdue_amount', label: 'Overdue Amount', required: false, category: 'Financial' },
  { key: 'paid_status', label: 'Paid Status', required: false, category: 'Financial' },
  
  // Loan Details
  { key: 'tenure', label: 'Tenure', required: false, category: 'Loan Details' },
  { key: 'payments_made', label: 'Payments Made', required: false, category: 'Loan Details' },
  { key: 'loan_type', label: 'Loan Type', required: false, category: 'Loan Details' },
  { key: 'product_name', label: 'Product Name', required: false, category: 'Loan Details' },
  { key: 'lending_partner', label: 'Lending Partner', required: false, category: 'Loan Details' },
  { key: 'loan_category', label: 'Loan Category', required: false, category: 'Loan Details' },
  { key: 'disbursal_date', label: 'Disbursal Date', required: false, category: 'Loan Details' },
  { key: 'due_date', label: 'Due Date', required: false, category: 'Loan Details' },
  
  // Delinquency
  { key: 'dpd_days', label: 'DPD Days', required: false, category: 'Delinquency' },
  { key: 'dpd_category', label: 'DPD Category', required: false, category: 'Delinquency' },
  { key: 'dpd_bucket', label: 'DPD Bucket', required: false, category: 'Delinquency' },
  { key: 'overdue_emis', label: 'Overdue EMIs', required: false, category: 'Delinquency' },
  { key: 'total_emi_paid', label: 'Total EMI Paid', required: false, category: 'Delinquency' },
  { key: 'dq_string', label: 'DQ String', required: false, category: 'Delinquency' },
  
  // Allocation & System
  { key: 'channel', label: 'Channel', required: false, category: 'Allocation' },
  { key: 'allocation_team', label: 'Allocation Team', required: false, category: 'Allocation' },
  { key: 'zone', label: 'Zone', required: false, category: 'Allocation' },
  { key: 'cluster', label: 'Cluster', required: false, category: 'Allocation' },
  { key: 'peak_category', label: 'Peak Category', required: false, category: 'Allocation' },
  { key: 'lot_type', label: 'Lot Type', required: false, category: 'Allocation' },
  { key: 'stab_forward', label: 'Stab Forward', required: false, category: 'Allocation' },
  { key: 'cohort_details', label: 'Cohort Details', required: false, category: 'Allocation' },
  { key: 'first_cohort_flag', label: 'First Cohort Flag', required: false, category: 'Allocation' },
  { key: 'allocation_status', label: 'Allocation Status', required: false, category: 'Allocation' },
  { key: 'company_id', label: 'Company ID', required: false, category: 'Allocation' },
  { key: 'batch_id', label: 'Batch ID', required: false, category: 'Allocation' },
  
  // System
  { key: 'extra_data', label: 'Extra Data (JSON)', required: false, category: 'System' },
];
