import { create } from 'zustand';

export type PostContext = {
  type: 'space' | 'discussion' | null;
  slug: string | null; // e.g. 'resources', 'coding', 'confession'
  label: string | null; // e.g. 'Resources', 'Coding', 'Confession'
  requiresApproval: boolean;
  isAnonymous: boolean;
};

const DEFAULT_CONTEXT: PostContext = {
  type: null,
  slug: null,
  label: null,
  requiresApproval: false,
  isAnonymous: false,
};

interface CreatePostState {
  open: boolean;
  context: PostContext;
  openDialog: () => void;
  openWithContext: (ctx: PostContext) => void;
  closeDialog: () => void;
  clearContext: () => void;
}

export const useCreatePostStore = create<CreatePostState>((set) => ({
  open: false,
  context: DEFAULT_CONTEXT,
  // Plain open (navbar / mobile FAB) always resets context first — this is
  // the global, section-agnostic entry point, so any context left over from
  // a previous context-locked open must not leak into it.
  openDialog: () => set({ open: true, context: DEFAULT_CONTEXT }),
  openWithContext: (ctx) => set({ open: true, context: ctx }),
  closeDialog: () => set({ open: false }),
  clearContext: () => set({ context: DEFAULT_CONTEXT }),
}));
