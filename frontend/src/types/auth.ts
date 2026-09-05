export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'OPERATIONS_MANAGER' | 'TEAM_LEAD' | 'TELECALLER';

export const SUPER_ROLES: Role[] = ['SUPER_ADMIN', 'ADMIN'];
export const ADMIN_ROLES: Role[] = ['SUPER_ADMIN', 'ADMIN', 'OPERATIONS_MANAGER'];
export const LEAD_AND_ABOVE: Role[] = ['SUPER_ADMIN', 'ADMIN', 'OPERATIONS_MANAGER', 'TEAM_LEAD'];

export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  OPERATIONS_MANAGER: 'Operations Manager',
  TEAM_LEAD: 'Team Lead',
  TELECALLER: 'Telecaller',
};

export interface User {
  id: string;
  employeeId?: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  isActive?: boolean;
  status?: string;
  tokenVersion?: number;
  profilePic?: string;
  teamLeadId?: string;
  teamLead?: { id: string; name: string };
  operationsManagerId?: string;
  operationsManager?: { id: string; name: string };
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface MonitoringConfig {
  id: string;
  inactivityThresholds: Record<Role, number>;
  lunchStartTime: string;
  lunchEndTime: string;
  autoLogoutEnabled: boolean;
}

export interface ActivitySummary {
  activeMin: number;
  inactiveMin: number;
  lunchMin: number;
  totalSessions: number;
}

export interface LiveUser {
  id: string;
  name: string;
  role: Role;
  status: 'ONLINE' | 'INACTIVE' | 'OFFLINE';
  lastSeen: string | null;
  connectedAt: string | null;
  todayActiveMin: number;
  todayInactiveMin: number;
  teamLead?: { id: string; name: string };
  operationsManager?: { id: string; name: string };
}

export interface InactivityAlert {
  id: string;
  userId: string;
  receiverId: string;
  durationMin: number;
  isRead: boolean;
  createdAt: string;
  user: { id: string; name: string; role: Role };
  receiver: { id: string; name: string };
}
