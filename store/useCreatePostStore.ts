import { create } from 'zustand';

interface CreatePostState {
  open: boolean;
  openDialog: () => void;
  closeDialog: () => void;
}

export const useCreatePostStore = create<CreatePostState>((set) => ({
  open: false,
  openDialog: () => set({ open: true }),
  closeDialog: () => set({ open: false }),
}));
