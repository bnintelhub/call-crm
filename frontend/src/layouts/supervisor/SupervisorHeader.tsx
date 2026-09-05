import React from 'react';
import Header from '../shared/Header';

interface SupervisorHeaderProps {
  toggleSidebar: () => void;
  onHelpClick?: () => void;
}

export const SupervisorHeader: React.FC<SupervisorHeaderProps> = (props) => {
  return <Header {...props} />;
};

export default SupervisorHeader;
