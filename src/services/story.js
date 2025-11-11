import createHttpError from 'http-errors';
import storyModel from '../models/storyModel.js';
import { CategoriesCollection } from '../models/categories.js';

const STORY_SORT_FIELDS = ['favoriteCount', 'date'];
const SORT_ORDER = ['asc', 'desc'];

const parseIntOr = (v, d) => {
  const n = parseInt(v);
  return Number.isNaN(n) ? d : n;
};

const parsePagination = (q) => ({
  page: parseIntOr(q.page, 1),
  perPage: parseIntOr(q.perPage ?? q.limit, 9),
});

const parseSort = (q) => {
  const sortBy = STORY_SORT_FIELDS.includes(q.sortBy) ? q.sortBy : 'date';
  const sortOrder = SORT_ORDER.includes(q.sortOrder) ? q.sortOrder : 'desc';
  return { sortBy, sortOrder };
};

export const getAllStories = async (query) => {
  const { page, perPage } = parsePagination(query);
  const { sortBy, sortOrder } = parseSort(query);
  const skip = (page - 1) * perPage;

  const filter = {};
  if (query.category) {
    filter.category = query.category;
  }

  const findQ = storyModel
    .find(filter)
    .populate('category', 'name')
    .populate('ownerId', 'name avatar bio')
    .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
    .skip(skip)
    .limit(perPage);

  const [total, stories] = await Promise.all([
    storyModel.countDocuments(filter),
    findQ,
  ]);

  const data = stories.map((doc) => {
    const o = doc.toObject();
    o.owner = o.ownerId;
    delete o.ownerId;
    return o;
  });

  return {
    data,
    page,
    perPage,
    total,
    totalPages: Math.ceil(total / perPage),
    hasNextPage: page * perPage < total,
    hasPrevPage: page > 1,
  };
};

export const getStoryById = async (storyId) => {
  const doc = await storyModel
    .findById(storyId)
    .populate('category', 'name')
    .populate('ownerId', 'name avatar bio')
    .lean();

  if (!doc) return null;

  doc.owner = doc.ownerId;
  delete doc.ownerId;
  return doc;
};

export const createStory = async (payload) => {
  return storyModel.create(payload);
};

export const updateStory = async (storyId, payload, user) => {
  const doc = await storyModel.findById(storyId);
  if (!doc) return null;

  if (!doc.ownerId.equals(user._id)) {
    throw createHttpError(403, 'You are not allowed to edit this story');
  }

  if (payload.category && typeof payload.category === 'string') {
    const cat = await CategoriesCollection.findOne({ name: payload.category });
    if (!cat) {
      throw createHttpError(400, `Category "${payload.category}" not found`);
    }
    payload.category = cat._id;
  }

  return storyModel.findByIdAndUpdate(storyId, payload, {
    new: true,
    runValidators: true,
  });
};

export const deleteStory = async (storyId, user) => {
  const doc = await storyModel.findById(storyId);
  if (!doc) return null;

  if (!doc.ownerId.equals(user._id)) {
    throw createHttpError(403, 'You are not allowed to delete this story');
  }

  await storyModel.deleteOne({ _id: storyId });
  return { _id: storyId };
};
