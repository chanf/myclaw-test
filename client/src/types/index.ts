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
