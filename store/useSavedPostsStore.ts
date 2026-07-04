import { create } from 'zustand';

interface SavedPostsState {
  savedPostIds: string[];
  isSaved: (postId: string) => boolean;
  toggleSaved: (postId: string) => void;
}

export const useSavedPostsStore = create<SavedPostsState>((set, get) => ({
  savedPostIds: [],
  isSaved: (postId) => get().savedPostIds.includes(postId),
  toggleSaved: (postId) =>
    set((state) => ({
      savedPostIds: state.savedPostIds.includes(postId)
        ? state.savedPostIds.filter((id) => id !== postId)
        : [...state.savedPostIds, postId],
    })),
}));
