import React from 'react';
import { ChevronDown } from 'lucide-react';
import { useOrgStore } from '../../store/orgStore';

interface OrganizationIdentityProps {
  companyName?: string;
  companyLogoLetter?: string;
  onClick?: () => void;
}

export const OrganizationIdentity: React.FC<OrganizationIdentityProps> = ({
  companyName: propCompanyName,
  companyLogoLetter: propLogoLetter,
  onClick,
}) => {
  const storeOrg = useOrgStore();
  const companyName = propCompanyName || storeOrg.companyName || 'Moneyview';
  const companyLogoLetter = propLogoLetter || storeOrg.companyLogoLetter || companyName.charAt(0).toUpperCase() || 'M';

  return (
    <div className="nav-org-identity" onClick={onClick} title={`Organization: ${companyName}`}>
      <div className="nav-org-logo-circle">
        <span className="nav-org-logo-text">{companyLogoLetter}</span>
      </div>
      <span className="nav-org-name">{companyName}</span>
      <ChevronDown size={14} className="nav-org-chevron" />
    </div>
  );
};

export default OrganizationIdentity;
