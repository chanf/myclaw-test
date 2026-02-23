import express from 'express';
import * as NoteController from '../controllers/notes';

const router = express.Router();

router.get('/', NoteController.getAllNotes);
router.get('/:id', NoteController.getNoteById);
router.post('/', NoteController.createNote);
router.put('/:id', NoteController.updateNote);
router.delete('/:id', NoteController.deleteNote);
router.get('/:id/tags', NoteController.getNoteTags);
router.post('/:id/tags', NoteController.addTagToNote);
router.delete('/:id/tags/:tagId', NoteController.removeTagFromNote);

export default router;
