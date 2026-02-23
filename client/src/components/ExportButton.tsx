'use client';

import { useState } from 'react';
import { Download, FileText, FileJson } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { api } from '@/lib/api';

export default function ExportButton() {
  const { currentNote } = useStore();
  const [showMenu, setShowMenu] = useState(false);

  if (!currentNote) return null;

  const handleExportAsMarkdown = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/export/notes/${currentNote.id}/markdown`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentNote.title}.md`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setShowMenu(false);
    } catch (error) {
      console.error('Failed to export:', error);
    }
  };

  const handleExportAsJSON = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/export/notes/${currentNote.id}/json`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentNote.title}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setShowMenu(false);
    } catch (error) {
      console.error('Failed to export:', error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
        title="导出"
      >
        <Download className="w-5 h-5 text-gray-600 dark:text-gray-400" />
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20 py-1 min-w-[160px]">
            <button
              onClick={handleExportAsMarkdown}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <FileText className="w-4 h-4" />
              导出为 Markdown
            </button>
            <button
              onClick={handleExportAsJSON}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <FileJson className="w-4 h-4" />
              导出为 JSON
            </button>
          </div>
        </>
      )}
    </div>
  );
}
