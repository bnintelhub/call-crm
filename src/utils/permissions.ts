import type { Role } from '../types';
import { SUPER_ROLES, ADMIN_ROLES, LEAD_AND_ABOVE } from '../types';

export function isSupervisorOrAbove(role?: Role): boolean {
  if (!role) return false;
  return LEAD_AND_ABOVE.includes(role);
}

export function isAdminOrAbove(role?: Role): boolean {
  if (!role) return false;
  return ADMIN_ROLES.includes(role);
}

export function isSuperAdmin(role?: Role): boolean {
  if (!role) return false;
  return SUPER_ROLES.includes(role);
}

export function isTelecaller(role?: Role): boolean {
  return role === 'TELECALLER';
}

export function canManageAgents(role?: Role): boolean {
  return isSupervisorOrAbove(role);
}

export function canUploadAllocation(role?: Role): boolean {
  return isSupervisorOrAbove(role);
}

export function canManageCampaigns(role?: Role): boolean {
  return isSupervisorOrAbove(role);
}
