import {
  registerUser,
  loginUser,
  refreshSession,
  logoutSession,
  resetPassword,
  requestPasswordReset,
} from '../services/auth.js';

const cookieOpts = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};

export async function registerUserController(req, res) {
  const user = await registerUser(req.body);

  const safe = {
    _id: user._id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  res.status(201).json({
    status: 201,
    message: 'Successfully registered a user!',
    data: safe,
  });
}

export async function loginUserController(req, res) {
  const { email, password } = req.body;

  const { sessionId, accessToken, refreshToken } = await loginUser(
    email,
    password,
  );

  res.cookie('refreshToken', refreshToken, {
    ...cookieOpts,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
  res.cookie('sid', sessionId, {
    ...cookieOpts,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    status: 200,
    message: 'Successfully logged in an user!',
    data: { accessToken },
  });
}

export async function refreshSessionController(req, res) {
  const { refreshToken } = req.cookies || {};
  if (!refreshToken) {
    return res.status(401).json({ status: 401, message: 'No refresh token' });
  }

  const {
    sessionId,
    accessToken,
    refreshToken: newRefresh,
  } = await refreshSession(refreshToken);

  res.cookie('refreshToken', newRefresh, {
    ...cookieOpts,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
  res.cookie('sid', sessionId, {
    ...cookieOpts,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    status: 200,
    message: 'Successfully refreshed a session!',
    data: { accessToken },
  });
}

export async function logoutController(req, res) {
  const { refreshToken, sid } = req.cookies || {};
  if (refreshToken && sid) {
    await logoutSession(sid, refreshToken);
  }

  res.clearCookie('refreshToken', { ...cookieOpts, maxAge: 0 });
  res.clearCookie('sid', { ...cookieOpts, maxAge: 0 });

  res.status(204).end();
}

export async function requestPasswordResetController(req, res) {
  const { email } = req.body;
  await requestPasswordReset(email);
  res.status(200).json({
    status: 200,
    message: 'Reset password email has been successfully sent.',
    data: {},
  });
}

export const sendResetEmailController = requestPasswordResetController;

export async function resetPasswordController(req, res) {
  const { token, password } = req.body;
  await resetPassword(token, password);

  res.status(200).json({
    status: 200,
    message: 'Password has been successfully reset.',
    data: {},
  });
}
