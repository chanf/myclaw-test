import express from 'express';
import * as FolderController from '../controllers/folders';

const router = express.Router();

router.get('/', FolderController.getAllFolders);
router.get('/tree', FolderController.getFolderTree);
router.get('/:id', FolderController.getFolderById);
router.post('/', FolderController.createFolder);
router.put('/:id', FolderController.updateFolder);
router.delete('/:id', FolderController.deleteFolder);
router.get('/:id/notes', FolderController.getFolderNotes);

export default router;
