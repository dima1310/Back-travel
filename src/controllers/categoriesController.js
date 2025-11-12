import { CategoriesCollection } from '../models/categories.js';

export const getCategoriesController = async (_req, res, next) => {
  try {
    const categories = await CategoriesCollection.find({}, { name: 1 }).lean();
    res.json({ status: 200, message: 'OK', data: categories });
  } catch (e) {
    next(e);
  }
};
