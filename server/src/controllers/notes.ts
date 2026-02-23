import { Request, Response } from 'express';
import { getDatabase } from '../db/database';
import { CreateNoteRequest, UpdateNoteRequest } from '../types';

export const getAllNotes = (req: Request, res: Response) => {
  const db = getDatabase();
  const { folder_id } = req.query;

  let query = 'SELECT * FROM notes ORDER BY updated_at DESC';
  const params: any[] = [];

  if (folder_id) {
    query += ' WHERE folder_id = ?';
    params.push(folder_id);
  }

  const notes = db.prepare(query).all(...params);
  res.json(notes);
};

export const getNoteById = (req: Request, res: Response) => {
  const db = getDatabase();
  const { id } = req.params;

  const note = db.prepare('SELECT * FROM notes WHERE id = ?').get(id);
  
  if (!note) {
    return res.status(404).json({ error: 'Note not found' });
  }

  const tags = db.prepare(`
    SELECT t.* FROM tags t
    JOIN note_tags nt ON t.id = nt.tag_id
    WHERE nt.note_id = ?
  `).all(id);

  res.json({ ...note, tags: tags.map((t: any) => t.name) });
};

export const createNote = (req: Request, res: Response) => {
  const db = getDatabase();
  const { title, content, folder_id, tags }: CreateNoteRequest = req.body;

  const stmt = db.prepare(`
    INSERT INTO notes (title, content, folder_id)
    VALUES (?, ?, ?)
  `);
  const result = stmt.run(title, content, folder_id || null);

  if (tags && tags.length > 0) {
    tags.forEach(tagName => {
      const tagStmt = db.prepare(`
        INSERT OR IGNORE INTO tags (name) VALUES (?)
      `).run(tagName);

      const tagId = db.prepare('SELECT id FROM tags WHERE name = ?').get(tagName) as any;

      if (tagId) {
        db.prepare(`
          INSERT OR IGNORE INTO note_tags (note_id, tag_id)
          VALUES (?, ?)
        `).run(result.lastInsertRowid, tagId.id);
      }
    });
  }

  res.status(201).json({ id: result.lastInsertRowid });
};

export const updateNote = (req: Request, res: Response) => {
  const db = getDatabase();
  const { id } = req.params;
  const { title, content, folder_id, tags }: UpdateNoteRequest = req.body;

  const updates: string[] = [];
  const params: any[] = [];

  if (title !== undefined) {
    updates.push('title = ?');
    params.push(title);
  }
  if (content !== undefined) {
    updates.push('content = ?');
    params.push(content);
  }
  if (folder_id !== undefined) {
    updates.push('folder_id = ?');
    params.push(folder_id);
  }

  if (updates.length > 0) {
    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    db.prepare(`
      UPDATE notes SET ${updates.join(', ')} WHERE id = ?
    `).run(...params);
  }

  if (tags !== undefined) {
    db.prepare('DELETE FROM note_tags WHERE note_id = ?').run(id);

    tags.forEach(tagName => {
      db.prepare('INSERT OR IGNORE INTO tags (name) VALUES (?)').run(tagName);

      const tagId = db.prepare('SELECT id FROM tags WHERE name = ?').get(tagName) as any;
      if (tagId) {
        db.prepare('INSERT OR IGNORE INTO note_tags (note_id, tag_id) VALUES (?, ?)').run(id, tagId.id);
      }
    });
  }

  res.json({ success: true });
};

export const deleteNote = (req: Request, res: Response) => {
  const db = getDatabase();
  const { id } = req.params;

  db.prepare('DELETE FROM notes WHERE id = ?').run(id);
  res.json({ success: true });
};

export const getNoteTags = (req: Request, res: Response) => {
  const db = getDatabase();
  const { id } = req.params;

  const tags = db.prepare(`
    SELECT t.* FROM tags t
    JOIN note_tags nt ON t.id = nt.tag_id
    WHERE nt.note_id = ?
  `).all(id);

  res.json(tags);
};

export const addTagToNote = (req: Request, res: Response) => {
  const db = getDatabase();
  const { id } = req.params;
  const { tagName } = req.body;

  db.prepare('INSERT OR IGNORE INTO tags (name) VALUES (?)').run(tagName);

  const tagId = db.prepare('SELECT id FROM tags WHERE name = ?').get(tagName) as any;
  if (tagId) {
    db.prepare('INSERT OR IGNORE INTO note_tags (note_id, tag_id) VALUES (?, ?)').run(id, tagId.id);
  }

  res.json({ success: true });
};

export const removeTagFromNote = (req: Request, res: Response) => {
  const db = getDatabase();
  const { id, tagId } = req.params;

  db.prepare('DELETE FROM note_tags WHERE note_id = ? AND tag_id = ?').run(id, tagId);
  res.json({ success: true });
};
