import { Router } from 'express';
import { getArticles } from '../controllers/articlesController.js';

const router = Router();

router.get('/', getArticles);

export default router;
