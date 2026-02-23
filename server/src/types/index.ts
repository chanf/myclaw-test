export interface Note {
  id: number;
  title: string;
  content: string;
  folder_id?: number;
  created_at: string;
  updated_at: string;
  tags?: string[];
}

export interface Folder {
  id: number;
  name: string;
  parent_id?: number;
  created_at: string;
  updated_at: string;
  children?: Folder[];
  notes_count?: number;
}

export interface Tag {
  id: number;
  name: string;
  created_at: string;
}

export interface AISuggestion {
  id: number;
  note_id: number;
  suggestion_type: string;
  content: string;
  created_at: string;
}

export interface CreateNoteRequest {
  title: string;
  content: string;
  folder_id?: number;
  tags?: string[];
}

export interface UpdateNoteRequest {
  title?: string;
  content?: string;
  folder_id?: number;
  tags?: string[];
}

export interface CreateFolderRequest {
  name: string;
  parent_id?: number;
}

export interface AIRequest {
  action: 'continue' | 'improve' | 'summarize' | 'translate' | 'rewrite';
  content: string;
  language?: string;
  tone?: string;
}

export interface AIResponse {
  success: boolean;
  content?: string;
  error?: string;
}

export interface SearchRequest {
  query: string;
  folder_id?: number;
  tags?: string[];
}

export interface SearchResult {
  notes: Note[];
  total: number;
}
