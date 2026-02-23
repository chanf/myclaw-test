'use client';

import { FileText, Trash2, MoreVertical, Calendar } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { api } from '@/lib/api';
import { Note } from '@/types';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NoteList() {
  const { notes, currentNote, setCurrentNote, setNotes, currentFolder } = useStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

  const handleDeleteNote = async (noteId: number) => {
    try {
      await api.notes.delete(noteId);
      const updatedNotes = notes.filter(n => n.id !== noteId);
      setNotes(updatedNotes);
      
      if (currentNote?.id === noteId) {
        setCurrentNote(null);
      }
      
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return '今天';
    } else if (diffDays === 1) {
      return '昨天';
    } else if (diffDays < 7) {
      return `${diffDays} 天前`;
    } else {
      return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
    }
  };

  if (notes.length === 0) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-500 px-2 py-2">
        {currentFolder ? '该文件夹暂无笔记' : '暂无笔记'}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {notes.map((note) => (
        <div
          key={note.id}
          onClick={() => setCurrentNote(note)}
          className={`group relative flex items-center gap-2 px-2 py-2 rounded cursor-pointer transition-colors ${
            currentNote?.id === note.id
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
              : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          <FileText className="w-4 h-4 shrink-0" />
          
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{note.title}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(note.updated_at)}
            </div>
          </div>

          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteConfirm(showDeleteConfirm === note.id ? null : note.id);
              }}
              className="p-1 hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400 rounded"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <AnimatePresence>
            {showDeleteConfirm === note.id && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10 p-2"
                onClick={(e) => e.stopPropagation()}
              >
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">确定删除此笔记？</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded"
                  >
                    删除
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="px-3 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded"
                  >
                    取消
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
