import { Router } from 'express';
import {
  getUsers,
  getUserById,
  getCurrentUser,
  addSavedArticle,
  removeSavedArticle,
  updateUser,
  updateAvatar,
} from '../controllers/usersController.js';

import { authenticate } from '../middlewares/authenticate.js';
import { upload } from '../middlewares/multer.js';
import { isValidId } from '../middlewares/isValidId.js';
import { validateBody } from '../middlewares/validateBody.js';
import { validateQuery } from '../middlewares/validateQuery.js';

import {
  getUsersQuerySchema,
  updateUserSchema,
  updateAvatarBodySchema,
} from '../validation/users.js';

const router = Router();

// публичные
router.get('/', validateQuery(getUsersQuerySchema), getUsers);
router.get('/current', authenticate, getCurrentUser);
router.get('/:userId', isValidId, getUserById);

// приватные
router.patch(
  '/update',
  authenticate,
  validateBody(updateUserSchema),
  updateUser,
);

router.patch(
  '/avatar',
  authenticate,
  upload.single('avatar'),
  validateBody(updateAvatarBodySchema),
  updateAvatar,
);

// saved/unsaved
router.post('/saved/:articleId', authenticate, isValidId, addSavedArticle);
router.delete('/saved/:articleId', authenticate, isValidId, removeSavedArticle);

export default router;
