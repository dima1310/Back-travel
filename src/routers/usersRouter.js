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

router.get('/', getUsers);
router.get('/:userId', getUserById);

router.get('/current', authMiddleware, getCurrentUser);
router.patch('/update', authMiddleware, updateUser);
router.patch('/avatar', authMiddleware, updateAvatar);
router.post('/saved/:articleId', authMiddleware, addSavedArticle);
router.delete('/saved/:articleId', authMiddleware, removeSavedArticle);

export default router;
