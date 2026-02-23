import { Request, Response } from 'express';
import { getDatabase } from '../db/database';
import { CreateFolderRequest } from '../types';

export const getAllFolders = (req: Request, res: Response) => {
  const db = getDatabase();
  const folders = db.prepare('SELECT * FROM folders ORDER BY name').all();
  res.json(folders);
};

export const getFolderTree = (req: Request, res: Response) => {
  const db = getDatabase();
  
  const buildTree = (parentId: number | null = null): any[] => {
    const query = `
      SELECT 
        f.*,
        COUNT(n.id) as notes_count
      FROM folders f
      LEFT JOIN notes n ON f.id = n.folder_id
      WHERE f.parent_id ${parentId ? '= ?' : 'IS NULL'}
      GROUP BY f.id
      ORDER BY f.name
    `;
    
    const folders = parentId 
      ? db.prepare(query).all(parentId)
      : db.prepare(query).all();
    
    return folders.map((folder: any) => ({
      ...folder,
      children: buildTree(folder.id)
    }));
  };

  const tree = buildTree();
  res.json(tree);
};

export const getFolderById = (req: Request, res: Response) => {
  const db = getDatabase();
  const { id } = req.params;

  const folder = db.prepare('SELECT * FROM folders WHERE id = ?').get(id);
  
  if (!folder) {
    return res.status(404).json({ error: 'Folder not found' });
  }

  res.json(folder);
};

export const createFolder = (req: Request, res: Response) => {
  const db = getDatabase();
  const { name, parent_id }: CreateFolderRequest = req.body;

  const stmt = db.prepare(`
    INSERT INTO folders (name, parent_id)
    VALUES (?, ?)
  `);
  const result = stmt.run(name, parent_id || null);

  res.status(201).json({ id: result.lastInsertRowid });
};

export const updateFolder = (req: Request, res: Response) => {
  const db = getDatabase();
  const { id } = req.params;
  const { name, parent_id } = req.body;

  db.prepare(`
    UPDATE folders SET name = ?, parent_id = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(name, parent_id || null, id);

  res.json({ success: true });
};

export const deleteFolder = (req: Request, res: Response) => {
  const db = getDatabase();
  const { id } = req.params;

  db.prepare('DELETE FROM folders WHERE id = ?').run(id);
  res.json({ success: true });
};

export const getFolderNotes = (req: Request, res: Response) => {
  const db = getDatabase();
  const { id } = req.params;

  const notes = db.prepare(`
    SELECT * FROM notes WHERE folder_id = ?
    ORDER BY updated_at DESC
  `).all(id);

  res.json(notes);
};
