import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isOnline: boolean;
  activeBreak: string | null;
  breakStartTime: number | null;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  setIsOnline: (val: boolean) => void;
  setActiveBreak: (breakName: string | null) => void;
}

const mockUser: User = {
  id: 'mock-id-1',
  employeeId: 'EMP-001',
  name: 'Demo Admin',
  email: 'admin@demo.com',
  role: 'SUPER_ADMIN',
  isActive: true
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isOnline: false,
      activeBreak: null,
      breakStartTime: null,
      setAuth: (token, user) => set({ token, user, isAuthenticated: true }),
      logout: () => set({ token: null, user: null, isAuthenticated: false, isOnline: false, activeBreak: null, breakStartTime: null }),
      updateUser: (user) => set({ user }),
      setIsOnline: (val) => set({ isOnline: val, activeBreak: null, breakStartTime: null }),
      setActiveBreak: (breakName) => set({ 
        activeBreak: breakName, 
        breakStartTime: breakName ? Date.now() : null,
        isOnline: false 
      }),
    }),
    {
      name: 'design-crm-auth-mock',
    }
  )
);
