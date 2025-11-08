import {
  registerUser,
  loginUser,
  refreshUsersSession,
  logoutUser,
} from '../services/auth.js';

const isProd = process.env.NODE_ENV === 'production';

const longCookieOpts = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'none' : 'lax',
  path: '/',
};

const setupSession = (res, session) => {
  res.cookie('accessToken', session.accessToken, {
    ...longCookieOpts,
    expires: session.accessTokenValidUntil,
  });

  res.cookie('refreshToken', session.refreshToken, {
    ...longCookieOpts,
    expires: session.refreshTokenValidUntil,
  });

  res.cookie('sessionId', session._id, {
    ...longCookieOpts,
    expires: session.refreshTokenValidUntil,
  });
};

export const registerUserController = async (req, res) => {
  const newUser = await registerUser(req.body);

  res.status(201).json({
    status: 201,
    message: 'Successfully registered a user!',
    data: {
      user: newUser,
    },
  });
};

export const loginUserController = async (req, res) => {
  const session = await loginUser(req.body);

  setupSession(res, session);

  res.json({
    status: 200,
    message: 'Successfully logged in an user!',
    data: {
      accessToken: session.accessToken,
    },
  });
};

export const refreshUserSessionController = async (req, res) => {
  const session = await refreshUsersSession(req.cookies);

  setupSession(res, session);

  res.json({
    status: 200,
    message: 'Successfully refreshed a session!',
    data: {
      accessToken: session.accessToken,
    },
  });
};

export const logoutUserController = async (req, res) => {
  if (req.cookies.sessionId) {
    await logoutUser(req.cookies.sessionId);
  }

  res.clearCookie('accessToken', { ...longCookieOpts, expires: new Date(0) });
  res.clearCookie('refreshToken', { ...longCookieOpts, expires: new Date(0) });
  res.clearCookie('sessionId', { ...longCookieOpts, expires: new Date(0) });

  res.status(204).send();
};
