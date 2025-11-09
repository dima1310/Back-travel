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
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

// Публічні
router.get('/', getUsers);
router.get('/current', authMiddleware, getCurrentUser); // 👈 вище!
router.get('/:userId', getUserById);

// Приватні
router.patch('/update', authMiddleware, updateUser);
router.patch('/avatar', authMiddleware, updateAvatar);
router.post('/saved/:articleId', authMiddleware, addSavedArticle);
router.delete('/saved/:articleId', authMiddleware, removeSavedArticle);

export default router;
