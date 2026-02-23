import { create } from 'zustand';
import { Note, Folder } from '@/types';

interface AppState {
  notes: Note[];
  folders: Folder[];
  currentNote: Note | null;
  currentFolder: Folder | null;
  isSidebarOpen: boolean;
  isAIPanelOpen: boolean;
  isDarkMode: boolean;
  searchQuery: string;
  isImmersiveMode: boolean;
  
  setNotes: (notes: Note[]) => void;
  setFolders: (folders: Folder[]) => void;
  setCurrentNote: (note: Note | null) => void;
  setCurrentFolder: (folder: Folder | null) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleAIPanel: () => void;
  setAIPanelOpen: (open: boolean) => void;
  toggleDarkMode: () => void;
  setSearchQuery: (query: string) => void;
  toggleImmersiveMode: () => void;
  setImmersiveMode: (mode: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  notes: [],
  folders: [],
  currentNote: null,
  currentFolder: null,
  isSidebarOpen: true,
  isAIPanelOpen: false,
  isDarkMode: false,
  searchQuery: '',
  isImmersiveMode: false,
  
  setNotes: (notes) => set({ notes }),
  setFolders: (folders) => set({ folders }),
  setCurrentNote: (note) => set({ currentNote: note }),
  setCurrentFolder: (folder) => set({ currentFolder: folder }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  toggleAIPanel: () => set((state) => ({ isAIPanelOpen: !state.isAIPanelOpen })),
  setAIPanelOpen: (open) => set({ isAIPanelOpen: open }),
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
  setSearchQuery: (query) => set({ searchQuery: query }),
  toggleImmersiveMode: () => set((state) => ({ isImmersiveMode: !state.isImmersiveMode })),
  setImmersiveMode: (mode) => set({ isImmersiveMode: mode })
}));
