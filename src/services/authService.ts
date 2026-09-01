import { authApi } from './api';

export const authService = {
  login: async (email: string, password: string) => {
    return authApi.login(email, password);
  },
  me: async () => {
    return authApi.me();
  },
  changePassword: async (currentPassword: string, newPassword: string) => {
    return authApi.changePassword(currentPassword, newPassword);
  },
};

export default authService;
