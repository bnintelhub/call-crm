/**
 * Activation Key & Credential Generator for SuperAdmin Tenant Provisioning
 * Format: companyname + planname + datetimevalidtill (16 characters)
 * Formatted with hyphens for high readability:
 * e.g. "UDAAN-IVR-20261004"
 * - Company Name : 5 characters (e.g. UDAAN, APEXR)
 * - Plan Name    : 3 characters (e.g. IVR, CRM, PRO)
 * - Valid Till   : 8 characters (YYYYMMDD, e.g. 20261004 = 04 Oct 2026)
 * Total characters without hyphens = exactly 16 characters!
 */

export function generateActivationKey(
  companyName: string,
  planName: string = 'IVR',
  validTillIso?: string
): string {
  // 1. Valid till date stamp: YYYYMMDD (8 characters)
  const expiryDate = validTillIso ? new Date(validTillIso) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const yyyy = String(expiryDate.getFullYear());
  const mm = String(expiryDate.getMonth() + 1).padStart(2, '0');
  const dd = String(expiryDate.getDate()).padStart(2, '0');
  const dateStr = `${yyyy}${mm}${dd}`;

  // 2. Plan code: 3 characters (e.g. IVR or CRM)
  const cleanPlan = (planName || 'IVR').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const planPart = cleanPlan.length >= 3 ? cleanPlan.slice(0, 3) : cleanPlan.padEnd(3, 'R');

  // 3. Company code: 5 characters to make total exact 16 characters (5 + 3 + 8 = 16)
  const cleanComp = (companyName || 'BNORB').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const companyPart = cleanComp.length >= 5 ? cleanComp.slice(0, 5) : cleanComp.padEnd(5, '0');

  return `${companyPart}-${planPart}-${dateStr}`;
}

export function parseActivationKey(key: string): {
  companyCode: string;
  plan: string;
  validTill: string;
  raw: string;
} | null {
  if (!key) return null;
  const clean = key.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  if (clean.length !== 16) return null;

  const companyCode = clean.slice(0, 5);
  const plan = clean.slice(5, 8);
  const yyyy = clean.slice(8, 12);
  const mm = clean.slice(12, 14);
  const dd = clean.slice(14, 16);
  const validTill = `${yyyy}-${mm}-${dd}`;

  return {
    companyCode,
    plan,
    validTill,
    raw: clean,
  };
}

export function generateStrongPassword(companyName?: string): string {
  const cleanName = (companyName || 'Orbit').replace(/[^a-zA-Z]/g, '');
  const prefix = cleanName.charAt(0).toUpperCase() + cleanName.slice(1, 4).toLowerCase();
  const specials = ['@', '#', '$', '!', '&'];
  const special = specials[Math.floor(Math.random() * specials.length)];
  const year = '2026';
  const num = Math.floor(100 + Math.random() * 900);
  return `${prefix || 'Apex'}${special}${year}#${num}`;
}

/**
 * Generates dedicated CRM Portal login email:
 * Format: admin_name@company_name<4-digits>.com
 * e.g. anjali@apex1043.com
 */
export function generateLoginEmail(
  adminName: string,
  companyName: string,
  fourDigits?: string | number
): string {
  const cleanAdmin = (adminName || 'admin')
    .trim()
    .toLowerCase()
    .split(/\s+/)[0]
    .replace(/[^a-z0-9]/g, '') || 'admin';

  const cleanCompany = (companyName || 'orbit')
    .trim()
    .toLowerCase()
    .split(/\s+/)[0]
    .replace(/[^a-z0-9]/g, '') || 'orbit';

  let numStr = '';
  if (fourDigits !== undefined && fourDigits !== null) {
    const d = String(fourDigits).replace(/[^0-9]/g, '');
    if (d.length >= 4) {
      numStr = d.slice(-4);
    } else if (d.length > 0) {
      numStr = d.padStart(4, '0');
    }
  }

  if (!numStr) {
    numStr = Math.floor(1000 + Math.random() * 9000).toString();
  }

  return `${cleanAdmin}@${cleanCompany}${numStr}.com`;
}

