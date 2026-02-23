import express from 'express';
import * as ExportController from '../controllers/export';

const router = express.Router();

router.get('/notes/:id/markdown', ExportController.exportNoteAsMarkdown);
router.get('/notes/:id/json', ExportController.exportNoteAsJSON);
router.get('/notes/all/json', ExportController.exportAllNotesAsJSON);

export default router;
