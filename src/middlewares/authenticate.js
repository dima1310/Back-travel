import createHttpError from 'http-errors';
import { Session } from '../models/session.js';
import { User } from '../models/userModel.js';

export async function authenticate(req, _res, next) {
  const auth = req.get('authorization') || '';
  const [, token] = auth.split(' ');

  if (!token) {
    return next(new createHttpError.Unauthorized('No access token'));
  }

  const session = await Session.findOne({ accessToken: token });
  if (!session) {
    return next(new createHttpError.Unauthorized('Not authorized'));
  }

  if (session.accessTokenValidUntil.getTime() <= Date.now()) {
    return next(new createHttpError.Unauthorized('Access token expired'));
  }

  const user = await User.findById(session.userId).lean();
  if (!user) {
    return next(new createHttpError.Unauthorized('Not authorized'));
  }

  req.user = user;
  next();
}
