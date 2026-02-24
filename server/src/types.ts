import { D1Database } from '@cloudflare/workers-types';

export interface Env {
  DB: D1Database;
  AZURE_OPENAI_KEY: string;
  AZURE_OPENAI_ENDPOINT: string;
  AZURE_API_VERSION: string;
  AZURE_DEPLOYMENT_NAME: string;
}

export interface Note {
  id: number;
  title: string;
  content: string;
  folder_id?: number;
  created_at: string;
  updated_at: string;
}

export interface Folder {
  id: number;
  name: string;
  parent_id?: number;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: number;
  name: string;
  created_at: string;
}

export interface NoteTag {
  note_id: number;
  tag_id: number;
}
