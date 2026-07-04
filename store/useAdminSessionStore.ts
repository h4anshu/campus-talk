import { create } from 'zustand';

interface AdminSessionState {
  isAdminAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

export const useAdminSessionStore = create<AdminSessionState>((set) => ({
  isAdminAuthenticated: false,
  login: () => set({ isAdminAuthenticated: true }),
  logout: () => set({ isAdminAuthenticated: false }),
}));
