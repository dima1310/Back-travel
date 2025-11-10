import createHttpError from "http-errors";
import { isValidObjectId } from "mongoose";

export const isValidId = (req, res, next) => {
    const { storyId } = req.params;
    if (!isValidObjectId(storyId)) {
        throw createHttpError(400, 'Bad Request');
    }
    next();
};
