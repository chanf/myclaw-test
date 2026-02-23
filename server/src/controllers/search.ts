import { Request, Response } from 'express';
import { getDatabase } from '../db/database';
import { SearchRequest, SearchResult } from '../types';

export const search = (req: Request, res: Response) => {
  const db = getDatabase();
  const { query, folder_id, tags }: SearchRequest = req.query as any;

  if (!query) {
    return res.status(400).json({ notes: [], total: 0 });
  }

  let sql = `
    SELECT DISTINCT n.* FROM notes n
    LEFT JOIN note_tags nt ON n.id = nt.note_id
    LEFT JOIN tags t ON nt.tag_id = t.id
    WHERE (n.title LIKE ? OR n.content LIKE ?)
  `;

  const params: any[] = [`%${query}%`, `%${query}%`];

  if (folder_id) {
    sql += ' AND n.folder_id = ?';
    params.push(folder_id);
  }

  if (tags) {
    const tagArray = Array.isArray(tags) ? tags : [tags];
    sql += ` AND t.name IN (${tagArray.map(() => '?').join(',')})`;
    params.push(...tagArray);
  }

  sql += ' ORDER BY n.updated_at DESC';

  const notes = db.prepare(sql).all(...params);
  res.json({ notes, total: notes.length });
};
