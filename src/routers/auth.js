import { Router } from 'express';
import { validateBody } from '../middlewares/validateBody.js';
import {
  registerSchema,
  loginSchema,
  sendResetEmailSchema,
  resetPasswordSchema,
} from '../validation/auth.js';

import {
  registerUserController,
  loginUserController,
  refreshSessionController,
  logoutController,
  sendResetEmailController,
  resetPasswordController,
} from '../controllers/auth.js';

export const authRouter = Router();

authRouter.post(
  '/register',
  validateBody(registerSchema),
  registerUserController,
);
authRouter.post('/login', validateBody(loginSchema), loginUserController);

// отправка письма на сброс
authRouter.post(
  '/send-reset-email',
  validateBody(sendResetEmailSchema),
  sendResetEmailController,
);

// собственно сброс пароля
authRouter.post(
  '/reset-pwd',
  validateBody(resetPasswordSchema),
  resetPasswordController,
);

authRouter.post('/refresh', refreshSessionController);
authRouter.post('/logout', logoutController);
