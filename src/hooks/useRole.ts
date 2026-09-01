import { useAuthStore } from '../store/authStore';
import { isSupervisorOrAbove, isAdminOrAbove, isSuperAdmin, isTelecaller } from '../utils/permissions';

export function useRole() {
  const { user } = useAuthStore();
  const role = user?.role;

  return {
    role,
    isSupervisor: isSupervisorOrAbove(role),
    isAdmin: isAdminOrAbove(role),
    isSuperAdmin: isSuperAdmin(role),
    isTelecaller: isTelecaller(role),
  };
}

export default useRole;
