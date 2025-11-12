import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { validateBody } from '../middlewares/validateBody.js';
import {
  createStoryController,
  deleteStoryController,
  getStoriesController,
  getStoryByIdController,
  patchStoryController,
} from '../controllers/storiesController.js';
import { isValidId } from '../middlewares/isValidId.js';
import { upload } from '../middlewares/multer.js';
import { createStorySchema, updateStorySchema } from '../validation/story.js';

const router = Router();

// public
router.get('/', getStoriesController);
router.get('/:storyId', isValidId, getStoryByIdController);

// private
router.post(
  '/',
  authenticate,
  upload.single('storyImage'),
  validateBody(createStorySchema),
  createStoryController,
);

router.patch(
  '/:storyId',
  authenticate,
  isValidId,
  upload.single('storyImage'),
  validateBody(updateStorySchema),
  patchStoryController,
);

router.delete('/:storyId', authenticate, isValidId, deleteStoryController);

export default router;
