import { Router } from 'express';
import {
    getUsers,
    getUserById,
    getCurrentUser,
    addSavedStory,
    removeSavedStory,
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
router.post('/saved/:storyId', authMiddleware, addSavedStory);
router.delete('/saved/:storyId', authMiddleware, removeSavedStory);

export default router;
