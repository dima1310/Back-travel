import { Router } from 'express';
import { validateBody } from '../middlewares/validateBody.js';
import {
  registerSchema,
  loginSchema,
  // sendResetEmailSchema,
  // resetPasswordSchema,
} from '../validation/auth.js';

import {
  registerUserController,
  loginUserController,
  refreshUserSessionController,
  logoutUserController,
  // sendResetEmailController,
  // resetPasswordController,
} from '../controllers/auth.js';

export const authRouter = Router();

authRouter.post(
  '/register',
  validateBody(registerSchema),
  registerUserController,
);
authRouter.post('/login', validateBody(loginSchema), loginUserController);

// // отправка письма на сброс
// authRouter.post(
//   '/send-reset-email',
//   validateBody(sendResetEmailSchema),
//   sendResetEmailController,
// );

// //  сброс пароля
// authRouter.post(
//   '/reset-pwd',
//   validateBody(resetPasswordSchema),
//   resetPasswordController,
// );

authRouter.post('/refresh', refreshUserSessionController);
authRouter.post('/logout', logoutUserController);
