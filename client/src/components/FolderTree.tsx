'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen, MoreVertical } from 'lucide-react';
import { Folder as FolderType } from '@/types';

interface FolderTreeProps {
  folders: FolderType[];
  currentFolder: FolderType | null;
  onSelectFolder: (folder: FolderType | null) => void;
  level: number;
}

export default function FolderTree({ folders, currentFolder, onSelectFolder, level }: FolderTreeProps) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const toggleExpand = (folderId: number) => {
    setExpanded((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  const renderFolder = (folder: FolderType) => {
    const isExpanded = expanded.has(folder.id);
    const isSelected = currentFolder?.id === folder.id;
    const hasChildren = folder.children && folder.children.length > 0;

    return (
      <div key={folder.id}>
        <div
          onClick={() => {
            onSelectFolder(folder);
            if (hasChildren) {
              toggleExpand(folder.id);
            }
          }}
          className={`flex items-center gap-1 px-2 py-1.5 rounded cursor-pointer transition-colors ${
            isSelected
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
              : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
        >
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(folder.id);
              }}
              className="p-0.5 hover:bg-gray-300 dark:hover:bg-gray-600 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </button>
          ) : (
            <span className="w-4" />
          )}
          
          {isExpanded ? (
            <FolderOpen className="w-4 h-4" />
          ) : (
            <Folder className="w-4 h-4" />
          )}
          
          <span className="flex-1 text-sm truncate">{folder.name}</span>
          
          {folder.notes_count !== undefined && folder.notes_count > 0 && (
            <span className="text-xs opacity-50">{folder.notes_count}</span>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div>
            {folder.children!.map((child) => renderFolder(child))}
          </div>
        )}
      </div>
    );
  };

  if (folders.length === 0) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-500 px-2 py-2">
        暂无文件夹
      </div>
    );
  }

  return (
    <div>
      {folders.map((folder) => renderFolder(folder))}
    </div>
  );
}
