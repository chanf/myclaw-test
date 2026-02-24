import { D1Database } from '@cloudflare/workers-types';
import { Note, Folder } from './types';

export class DatabaseService {
  constructor(private db: D1Database) {}

  async getAllNotes(folderId?: number): Promise<Note[]> {
    let query = 'SELECT * FROM notes ORDER BY updated_at DESC';
    const params: any[] = [];

    if (folderId !== undefined) {
      query += ' WHERE folder_id = ?';
      params.push(folderId);
    }

    const result = await this.db.prepare(query).bind(...params).all<Note>();
    return result.results || [];
  }

  async getNoteById(id: number): Promise<Note | null> {
    const result = await this.db.prepare('SELECT * FROM notes WHERE id = ?').bind(id).first<Note>();
    return result || null;
  }

  async createNote(data: { title: string; content: string; folder_id?: number }): Promise<number> {
    const result = await this.db.prepare(`
      INSERT INTO notes (title, content, folder_id)
      VALUES (?, ?, ?)
    `).bind(data.title, data.content, data.folder_id || null).run();

    return result.meta.last_row_id;
  }

  async updateNote(id: number, data: { title?: string; content?: string; folder_id?: number }): Promise<boolean> {
    const updates: string[] = [];
    const params: any[] = [];

    if (data.title !== undefined) {
      updates.push('title = ?');
      params.push(data.title);
    }
    if (data.content !== undefined) {
      updates.push('content = ?');
      params.push(data.content);
    }
    if (data.folder_id !== undefined) {
      updates.push('folder_id = ?');
      params.push(data.folder_id);
    }

    if (updates.length > 0) {
      updates.push('updated_at = ?');
      params.push(new Date().toISOString());
      params.push(id);

      const query = `UPDATE notes SET ${updates.join(', ')} WHERE id = ?`;
      await this.db.prepare(query).bind(...params).run();
      return true;
    }
    return false;
  }

  async deleteNote(id: number): Promise<boolean> {
    await this.db.prepare('DELETE FROM notes WHERE id = ?').bind(id).run();
    return true;
  }

  async getAllFolders(): Promise<Folder[]> {
    const result = await this.db.prepare('SELECT * FROM folders ORDER BY name').all<Folder>();
    return result.results || [];
  }

  async getFolderTree(): Promise<Folder[]> {
    const buildTree = async (parentId: number | null = null): Promise<Folder[]> => {
      const folders = parentId
        ? await this.db.prepare('SELECT * FROM folders WHERE parent_id = ? ORDER BY name').bind(parentId).all<Folder>()
        : await this.db.prepare('SELECT * FROM folders WHERE parent_id IS NULL ORDER BY name').all<Folder>();

      const folderList = folders.results || [];

      for (const folder of folderList) {
        const children = await buildTree(folder.id);
        (folder as any).children = children;
        
        // Get notes count
        const countResult = await this.db.prepare('SELECT COUNT(*) as count FROM notes WHERE folder_id = ?').bind(folder.id).first<{ count: number }>();
        (folder as any).notes_count = countResult?.count || 0;
      }

      return folderList;
    };

    return await buildTree();
  }

  async getFolderById(id: number): Promise<Folder | null> {
    const result = await this.db.prepare('SELECT * FROM folders WHERE id = ?').bind(id).first<Folder>();
    return result || null;
  }

  async createFolder(data: { name: string; parent_id?: number }): Promise<number> {
    const result = await this.db.prepare(`
      INSERT INTO folders (name, parent_id)
      VALUES (?, ?)
    `).bind(data.name, data.parent_id || null).run();

    return result.meta.last_row_id;
  }

  async updateFolder(id: number, data: { name?: string; parent_id?: number }): Promise<boolean> {
    const updates: string[] = [];
    const params: any[] = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      params.push(data.name);
    }
    if (data.parent_id !== undefined) {
      updates.push('parent_id = ?');
      params.push(data.parent_id);
    }

    if (updates.length > 0) {
      updates.push('updated_at = ?');
      params.push(new Date().toISOString());
      params.push(id);

      const query = `UPDATE folders SET ${updates.join(', ')} WHERE id = ?`;
      await this.db.prepare(query).bind(...params).run();
      return true;
    }
    return false;
  }

  async deleteFolder(id: number): Promise<boolean> {
    await this.db.prepare('DELETE FROM folders WHERE id = ?').bind(id).run();
    return true;
  }

  async getFolderNotes(folderId: number): Promise<Note[]> {
    const result = await this.db.prepare(`
      SELECT * FROM notes WHERE folder_id = ?
      ORDER BY updated_at DESC
    `).bind(folderId).all<Note>();
    return result.results || [];
  }

  async addTagToNote(noteId: number, tagName: string): Promise<boolean> {
    // Insert tag if not exists
    await this.db.prepare('INSERT OR IGNORE INTO tags (name) VALUES (?)').bind(tagName).run();

    // Get tag id
    const tag = await this.db.prepare('SELECT id FROM tags WHERE name = ?').bind(tagName).first<{ id: number }>();
    if (!tag) return false;

    // Link note and tag
    await this.db.prepare('INSERT OR IGNORE INTO note_tags (note_id, tag_id) VALUES (?, ?)').bind(noteId, tag.id).run();
    return true;
  }

  async removeTagFromNote(noteId: number, tagId: number): Promise<boolean> {
    await this.db.prepare('DELETE FROM note_tags WHERE note_id = ? AND tag_id = ?').bind(noteId, tagId).run();
    return true;
  }

  async getNoteTags(noteId: number): Promise<any[]> {
    const result = await this.db.prepare(`
      SELECT t.* FROM tags t
      JOIN note_tags nt ON t.id = nt.tag_id
      WHERE nt.note_id = ?
    `).bind(noteId).all();
    return result.results || [];
  }

  async searchNotes(query: string, folderId?: number, tags?: string[]): Promise<Note[]> {
    let sql = `
      SELECT DISTINCT n.* FROM notes n
      LEFT JOIN note_tags nt ON n.id = nt.note_id
      LEFT JOIN tags t ON nt.tag_id = t.id
      WHERE (n.title LIKE ? OR n.content LIKE ?)
    `;
    const params: any[] = [`%${query}%`, `%${query}%`];

    if (folderId !== undefined) {
      sql += ' AND n.folder_id = ?';
      params.push(folderId);
    }

    if (tags && tags.length > 0) {
      sql += ` AND t.name IN (${tags.map(() => '?').join(',')})`;
      params.push(...tags);
    }

    sql += ' ORDER BY n.updated_at DESC';

    const result = await this.db.prepare(sql).bind(...params).all<Note>();
    return result.results || [];
  }
}
