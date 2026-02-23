import { Request, Response } from 'express';
import { getDatabase } from '../db/database';

export const exportNoteAsMarkdown = (req: Request, res: Response) => {
  const db = getDatabase();
  const { id } = req.params;

  const note = db.prepare('SELECT * FROM notes WHERE id = ?').get(id);
  
  if (!note) {
    return res.status(404).json({ error: 'Note not found' });
  }

  const noteTitle = (note as any).title;
  const sanitizedTitle = noteTitle.replace(/[^\w\u4e00-\u9fa5\-\.]/g, '_');
  const content = `# ${noteTitle}\n\nCreated: ${(note as any).created_at}\nUpdated: ${(note as any).updated_at}\n\n${(note as any).content}`;

  res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(sanitizedTitle)}.md"`);
  res.send(content);
};

export const exportNoteAsJSON = (req: Request, res: Response) => {
  const db = getDatabase();
  const { id } = req.params;

  const note = db.prepare('SELECT * FROM notes WHERE id = ?').get(id);
  
  if (!note) {
    return res.status(404).json({ error: 'Note not found' });
  }

  const noteTitle = (note as any).title;
  const sanitizedTitle = noteTitle.replace(/[^\w\u4e00-\u9fa5\-\.]/g, '_');

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(sanitizedTitle)}.json"`);
  res.json(note);
};

export const exportAllNotesAsJSON = (req: Request, res: Response) => {
  const db = getDatabase();
  const notes = db.prepare('SELECT * FROM notes ORDER BY updated_at DESC').all();

  const exportData = {
    exported_at: new Date().toISOString(),
    total_notes: notes.length,
    notes
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="notes_export_${new Date().toISOString().split('T')[0]}.json"`);
  res.json(exportData);
};
