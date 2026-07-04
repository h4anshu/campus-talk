import { create } from 'zustand';

interface ContactAdminState {
  open: boolean;
  openDialog: () => void;
  closeDialog: () => void;
}

export const useContactAdminStore = create<ContactAdminState>((set) => ({
  open: false,
  openDialog: () => set({ open: true }),
  closeDialog: () => set({ open: false }),
}));
