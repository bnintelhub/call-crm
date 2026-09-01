import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface OrgState {
  companyName: string;
  companyLogoLetter: string;
  setOrg: (name: string, logoLetter?: string) => void;
}

export const useOrgStore = create<OrgState>()(
  persist(
    (set) => ({
      companyName: 'Moneyview',
      companyLogoLetter: 'M',
      setOrg: (companyName, logoLetter) =>
        set({
          companyName,
          companyLogoLetter: logoLetter || companyName.charAt(0).toUpperCase() || 'M',
        }),
    }),
    {
      name: 'design-crm-org-store',
    }
  )
);

export default useOrgStore;
