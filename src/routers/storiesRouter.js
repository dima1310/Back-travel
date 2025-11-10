import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { validateBody } from '../middlewares/validateBody.js';
import { createStorySchema } from '../validation/story.js';
import { createStoryController, deleteStoryController, getStoriesController, getStoryByIdController, patchStoryController } from '../controllers/storiesController.js';
import { isValidId } from '../middlewares/isValidId.js';
import { upload } from '../middlewares/upload.js';

const router = Router();

router.get('/', getStoriesController);
router.get('/:storyId', isValidId, getStoryByIdController);
router.post('/', authenticate, upload.single('storyImage'), validateBody(createStorySchema), createStoryController);
router.patch('/:storyId', authenticate, upload.single('storyImage'), isValidId, validateBody(createStorySchema), patchStoryController);
router.delete('/:storyId', isValidId, deleteStoryController);

export default router;
