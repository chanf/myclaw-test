'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Folder, 
  FolderOpen, 
  Plus, 
  Search, 
  Settings,
  Moon,
  Sun,
  Keyboard,
  Menu,
  X
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { api } from '@/lib/api';
import FolderTree from './FolderTree';
import NoteList from './NoteList';

export default function Sidebar() {
  const { 
    folders, 
    currentFolder, 
    currentNote,
    isSidebarOpen,
    toggleSidebar,
    setCurrentFolder,
    setCurrentNote,
    toggleImmersiveMode
  } = useStore();

  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      await api.folders.create({ name: newFolderName });
      const foldersData = await api.folders.getTree();
      useStore.getState().setFolders(foldersData);
      setNewFolderName('');
      setShowCreateFolder(false);
    } catch (error) {
      console.error('Failed to create folder:', error);
    }
  };

  const handleCreateNote = async () => {
    try {
      const data = await api.notes.create({
        title: '新笔记',
        content: '',
        folder_id: currentFolder?.id
      });
      const notesData = await api.notes.getAll(currentFolder?.id);
      useStore.getState().setNotes(notesData);
      const fullNote = await api.notes.getById(data.id);
      setCurrentNote(fullNote);
    } catch (error) {
      console.error('Failed to create note:', error);
    }
  };

  return (
    <motion.aside 
      initial={{ width: 0 }}
      animate={{ width: isSidebarOpen ? 280 : 0 }}
      className="sidebar bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      <div className="w-[280px] h-full flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">AI Note</h1>
            <button
              onClick={toggleSidebar}
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
          
          <div className="space-y-2">
            <button
              onClick={handleCreateNote}
              className="w-full flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              新建笔记
            </button>
            
            <button
              onClick={() => setShowCreateFolder(true)}
              className="w-full flex items-center gap-2 px-3 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              新建文件夹
            </button>
          </div>

          <AnimatePresence>
            {showCreateFolder && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2"
              >
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                    placeholder="文件夹名称"
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  <button
                    onClick={handleCreateFolder}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    确定
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateFolder(false);
                      setNewFolderName('');
                    }}
                    className="px-3 py-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-700 dark:text-white rounded-lg transition-colors"
                  >
                    取消
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
              <Folder className="w-4 h-4" />
              <span className="font-medium">文件夹</span>
            </div>
            <FolderTree 
              folders={folders} 
              currentFolder={currentFolder}
              onSelectFolder={setCurrentFolder}
              level={0}
            />
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
              <FileText className="w-4 h-4" />
              <span className="font-medium">笔记</span>
              {currentFolder && <span className="text-xs">({currentFolder.name})</span>}
            </div>
            <NoteList />
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
          <button
            onClick={toggleImmersiveMode}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Keyboard className="w-4 h-4" />
            沉浸模式
            <span className="ml-auto text-xs opacity-50">Cmd+Shift+F</span>
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
