'use client';

import { useState, useEffect, useRef } from 'react';
import MDEditor from '@uiw/react-md-editor';
import { useStore } from '@/store/useStore';
import { api } from '@/lib/api';
import { Save, Eye, EyeOff } from 'lucide-react';

export default function Editor() {
  const { currentNote, setCurrentNote, isAIPanelOpen, toggleAIPanel } = useStore();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (currentNote) {
      setTitle(currentNote.title);
      setContent(currentNote.content);
    }
  }, [currentNote]);

  const autoSave = async () => {
    if (!currentNote) return;

    clearTimeout(saveTimeoutRef.current);
    setSaving(true);

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await api.notes.update(currentNote.id, { title, content });
        const updatedNote = await api.notes.getById(currentNote.id);
        setCurrentNote(updatedNote);
        setSaving(false);
      } catch (error) {
        console.error('Failed to save note:', error);
        setSaving(false);
      }
    }, 500);
  };

  useEffect(() => {
    autoSave();
  }, [title, content]);

  if (!currentNote) {
    return null;
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="无标题"
          className="w-full text-2xl font-bold bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400"
        />
        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
          {saving && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              保存中...
            </span>
          )}
          <span>最后修改: {new Date(currentNote.updated_at).toLocaleString('zh-CN')}</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-6 py-4">
        <MDEditor
          value={content}
          onChange={(val) => setContent(val || '')}
          preview={isPreview ? 'preview' : 'edit'}
          hideToolbar={false}
          visibleDragBar={false}
          height="100%"
          textareaProps={{
            placeholder: '开始写作...\n\n# Markdown 提示\n\n- 使用 # 创建标题\n- 使用 **粗体** 和 *斜体*\n- 使用 - 或 * 创建列表\n- 使用 \`代码\` 创建行内代码\n- 使用 ``` 创建代码块',
            className: 'focus:outline-none'
          }}
          className="immersive-editor"
          data-color-mode="auto"
        />
      </div>

      <div className="fixed bottom-6 right-6 flex gap-2 z-10">
        <button
          onClick={() => setIsPreview(!isPreview)}
          className="p-3 bg-white dark:bg-gray-800 shadow-lg rounded-full hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700"
          title={isPreview ? '编辑模式' : '预览模式'}
        >
          {isPreview ? (
            <EyeOff className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          ) : (
            <Eye className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          )}
        </button>

        <button
          onClick={toggleAIPanel}
          className="p-3 bg-blue-600 hover:bg-blue-700 shadow-lg rounded-full hover:shadow-xl transition-shadow"
          title="AI 助手"
        >
          <Save className="w-5 h-5 text-white" />
        </button>
      </div>

      <style jsx global>{`
        .immersive-editor .w-md-editor {
          background: transparent !important;
          border: none !important;
        }
        .immersive-editor .w-md-editor-text-input,
        .immersive-editor .w-md-editor-text {
          background: transparent !important;
          color: inherit !important;
        }
        .immersive-editor .w-md-editor-text {
          font-size: 16px;
          line-height: 1.8;
        }
        .immersive-editor .w-md-editor-text-input {
          font-size: 16px;
          line-height: 1.8;
          font-family: inherit;
        }
        .immersive-editor .w-md-editor-text h1 {
          font-size: 2em;
          font-weight: 700;
          margin: 0.67em 0;
        }
        .immersive-editor .w-md-editor-text h2 {
          font-size: 1.5em;
          font-weight: 600;
          margin: 0.75em 0;
        }
        .immersive-editor .w-md-editor-text h3 {
          font-size: 1.25em;
          font-weight: 600;
          margin: 0.83em 0;
        }
        .immersive-editor .w-md-editor-text p {
          margin: 1em 0;
          line-height: 1.8;
        }
        .immersive-editor .w-md-editor-text pre {
          background: rgba(0, 0, 0, 0.05);
          padding: 1em;
          border-radius: 0.5em;
          overflow-x: auto;
        }
        .dark .immersive-editor .w-md-editor-text pre {
          background: rgba(255, 255, 255, 0.05);
        }
      `}</style>
    </div>
  );
}
