import { isValidObjectId } from 'mongoose';
import createHttpError from 'http-errors';

export const isValidId = (req, _res, next) => {
  const id =
    req.params.id ||
    req.params.storyId ||
    req.params.userId ||
    req.params.articleId;
  if (id && !isValidObjectId(id)) {
    return next(createHttpError(400, `${id} is not a valid id`));
  }
  next();
};
