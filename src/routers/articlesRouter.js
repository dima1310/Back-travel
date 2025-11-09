import { Router } from 'express';
import { createArticle, getArticles, updateArticle } from '../controllers/articlesController.js';
import { authenticate } from '../middlewares/authenticate.js';
import { validateBody } from '../middlewares/validateBody.js';
import { createArticleSchema } from '../validation/article.js';


const router = Router();

router.get('/', getArticles);
router.post('/', authenticate, validateBody(createArticleSchema), createArticle);
router.patch('/:articleId', authenticate, validateBody(createArticleSchema),  updateArticle);

export default router;
