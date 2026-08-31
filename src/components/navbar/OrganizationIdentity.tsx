import React from 'react';
import { ChevronDown, Building2 } from 'lucide-react';

interface OrganizationIdentityProps {
  companyName?: string;
  companyLogoLetter?: string;
  onClick?: () => void;
}

export const OrganizationIdentity: React.FC<OrganizationIdentityProps> = ({
  companyName = 'Moneyview',
  companyLogoLetter = 'M',
  onClick,
}) => {
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
