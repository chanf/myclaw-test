import express from 'express';
import * as AIController from '../controllers/ai';

const router = express.Router();

router.post('/assist', AIController.assist);

export default router;
