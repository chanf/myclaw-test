'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wand2, 
  Send, 
  Copy, 
  Check,
  Loader2,
  Sparkles,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { api } from '@/lib/api';
import { useStore } from '@/store/useStore';

export default function AIPanel() {
  const { currentNote, toggleAIPanel, isAIPanelOpen } = useStore();
  const [selectedAction, setSelectedAction] = useState<string>('continue');
  const [aiResponse, setAiResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const actions = [
    { id: 'continue', label: '续写', icon: Sparkles, description: '自动续写内容' },
    { id: 'improve', label: '优化', icon: RefreshCw, description: '改进文本质量' },
    { id: 'summarize', label: '总结', icon: Check, description: '生成摘要' },
    { id: 'translate', label: '翻译', icon: Wand2, description: '翻译成其他语言' },
    { id: 'rewrite', label: '改写', icon: Sparkles, description: '改变写作风格' }
  ];

  const handleGenerate = async () => {
    if (!currentNote || loading) return;

    setLoading(true);
    setAiResponse('');

    try {
      const response = await api.ai.assist({
        action: selectedAction as any,
        content: currentNote.content
      });

      if (response.success && response.content) {
        setAiResponse(response.content);
      }
    } catch (error) {
      console.error('AI assist error:', error);
      setAiResponse('抱歉，AI 助手遇到了一些问题，请稍后再试。');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!aiResponse) return;
    
    navigator.clipboard.writeText(aiResponse);
    setCopied(true);
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const handleApply = () => {
    if (!currentNote || !aiResponse) return;

    const newContent = currentNote.content + '\n\n' + aiResponse;
    api.notes.update(currentNote.id, { content: newContent });
    useStore.getState().setCurrentNote({
      ...currentNote,
      content: newContent
    });
    
    setAiResponse('');
  };

  return (
    <motion.aside
      initial={{ x: '100%' }}
      animate={{ x: isAIPanelOpen ? 0 : '100%' }}
      className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-2xl z-20 overflow-hidden"
    >
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI 助手</h2>
          </div>
          <button
            onClick={toggleAIPanel}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <Trash2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              选择操作
            </label>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {actions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    onClick={() => setSelectedAction(action.id)}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      selectedAction === action.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <Icon className={`w-4 h-4 mb-1 ${
                      selectedAction === action.id ? 'text-blue-600' : 'text-gray-500 dark:text-gray-400'
                    }`} />
                    <div className={`text-sm font-medium ${
                      selectedAction === action.id ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-white'
                    }`}>
                      {action.label}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {action.description}
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !currentNote}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-lg transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  开始生成
                </>
              )}
            </button>
          </div>

          <AnimatePresence>
            {aiResponse && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="p-4 border-t border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">AI 响应</h3>
                  <div className="flex gap-1">
                    <button
                      onClick={handleCopy}
                      className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                      title="复制"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 text-sm text-gray-700 dark:text-gray-300 max-h-64 overflow-y-auto whitespace-pre-wrap">
                  {aiResponse}
                </div>
                <button
                  onClick={handleApply}
                  className="mt-3 w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
                >
                  应用到笔记
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  );
}
