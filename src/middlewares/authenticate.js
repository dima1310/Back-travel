import createHttpError from 'http-errors';
import { findSession, findUser } from '../services/auth.js';

export const authenticate = async (req, res, next) => {
  const authHeader = req.get('Authorization');
  let accessToken;

  if (authHeader) {
    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer') {
      return next(createHttpError(401, 'Auth header should be of type Bearer'));
    }
    accessToken = token;
  } else {
    accessToken = req.cookies?.accessToken;
  }

  if (!accessToken) {
    return next(createHttpError(401, 'No access token'));
  }

  const session = await findSession({ accessToken });
  if (!session) {
    return next(createHttpError(401, 'Session not found'));
  }

  if (session.accessTokenValidUntil < new Date()) {
    return next(createHttpError(401, 'Access token expired'));
  }

  const user = await findUser({ _id: session.userId });
  if (!user) {
    return next(createHttpError(401, 'Not authorized'));
  }

  req.user = user;
  next();
};
