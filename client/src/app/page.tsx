'use client';

import { useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Editor from '@/components/Editor';
import AIPanel from '@/components/AIPanel';
import TopBar from '@/components/TopBar';
import { useStore } from '@/store/useStore';
import { api } from '@/lib/api';

export default function Home() {
  const { 
    notes, 
    folders, 
    currentNote, 
    isSidebarOpen, 
    isAIPanelOpen, 
    isImmersiveMode,
    setNotes, 
    setFolders 
  } = useStore();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [notesData, foldersData] = await Promise.all([
        api.notes.getAll(),
        api.folders.getTree()
      ]);
      setNotes(notesData);
      setFolders(foldersData);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  return (
    <div className={`flex h-screen overflow-hidden bg-white dark:bg-gray-900 ${isImmersiveMode ? 'immersive' : ''}`}>
      {!isImmersiveMode && isSidebarOpen && <Sidebar />}
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {!isImmersiveMode && <TopBar />}
        <div className="flex-1 flex overflow-hidden">
          <main className={`flex-1 overflow-hidden ${isAIPanelOpen ? 'mr-96' : ''}`}>
            {currentNote ? (
              <Editor />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <svg className="w-24 h-24 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <p className="text-lg">选择或创建一个笔记开始写作</p>
                </div>
              </div>
            )}
          </main>
          
          {isAIPanelOpen && !isImmersiveMode && <AIPanel />}
        </div>
      </div>

      <style jsx global>{`
        .immersive .sidebar,
        .immersive .top-bar {
          display: none;
        }
        .immersive main {
          max-width: 900px;
          margin: 0 auto;
        }
      `}</style>
    </div>
  );
}
