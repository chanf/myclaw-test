const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const api = {
  notes: {
    getAll: async (folderId?: number) => {
      const params = folderId ? `?folder_id=${folderId}` : '';
      const res = await fetch(`${API_BASE}/notes${params}`);
      if (!res.ok) throw new Error('Failed to fetch notes');
      return res.json();
    },
    
    getById: async (id: number) => {
      const res = await fetch(`${API_BASE}/notes/${id}`);
      if (!res.ok) throw new Error('Failed to fetch note');
      return res.json();
    },
    
    create: async (data: { title: string; content: string; folder_id?: number; tags?: string[] }) => {
      const res = await fetch(`${API_BASE}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to create note');
      return res.json();
    },
    
    update: async (id: number, data: { title?: string; content?: string; folder_id?: number; tags?: string[] }) => {
      const res = await fetch(`${API_BASE}/notes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to update note');
      return res.json();
    },
    
    delete: async (id: number) => {
      const res = await fetch(`${API_BASE}/notes/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete note');
      return res.json();
    }
  },
  
  folders: {
    getAll: async () => {
      const res = await fetch(`${API_BASE}/folders`);
      if (!res.ok) throw new Error('Failed to fetch folders');
      return res.json();
    },
    
    getTree: async () => {
      const res = await fetch(`${API_BASE}/folders/tree`);
      if (!res.ok) throw new Error('Failed to fetch folder tree');
      return res.json();
    },
    
    getById: async (id: number) => {
      const res = await fetch(`${API_BASE}/folders/${id}`);
      if (!res.ok) throw new Error('Failed to fetch folder');
      return res.json();
    },
    
    create: async (data: { name: string; parent_id?: number }) => {
      const res = await fetch(`${API_BASE}/folders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to create folder');
      return res.json();
    },
    
    update: async (id: number, data: { name: string; parent_id?: number }) => {
      const res = await fetch(`${API_BASE}/folders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to update folder');
      return res.json();
    },
    
    delete: async (id: number) => {
      const res = await fetch(`${API_BASE}/folders/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete folder');
      return res.json();
    },
    
    getNotes: async (id: number) => {
      const res = await fetch(`${API_BASE}/folders/${id}/notes`);
      if (!res.ok) throw new Error('Failed to fetch folder notes');
      return res.json();
    }
  },
  
  ai: {
    assist: async (data: { action: string; content: string; language?: string; tone?: string }) => {
      const res = await fetch(`${API_BASE}/ai/assist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to get AI assistance');
      return res.json();
    }
  },
  
  search: {
    query: async (params: { query: string; folder_id?: number; tags?: string[] }) => {
      const searchParams = new URLSearchParams(params as any);
      const res = await fetch(`${API_BASE}/search?${searchParams}`);
      if (!res.ok) throw new Error('Failed to search');
      return res.json();
    }
  }
};
