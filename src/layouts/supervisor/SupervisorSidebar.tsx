import React from 'react';
import SidebarBase from '../shared/Sidebar';

interface SupervisorSidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

export const SupervisorSidebar: React.FC<SupervisorSidebarProps> = (props) => {
  return <SidebarBase {...props} />;
};

export default SupervisorSidebar;
