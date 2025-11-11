import mongoose from 'mongoose';
import createHttpError from 'http-errors';
import storyModel from '../models/storyModel.js';
import { CategoriesCollection } from '../models/categories.js';

const STORY_SORT_FIELDS = ['favoriteCount', 'date'];
const SORT_ORDER = ['asc', 'desc'];

const parseIntOr = (v, d) => {
  const n = parseInt(v, 10);
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

const mapDoc = (doc) => {
  const o = doc.toObject ? doc.toObject() : structuredClone(doc);

  if (!o.description && o.article) o.description = o.article;

  if (o.ownerId && typeof o.ownerId === 'object') {
    o.owner = {
      _id: o.ownerId._id,
      name: o.ownerId.name,
      avatar: o.ownerId.avatarUrl ?? '',
      bio: o.ownerId.description ?? '',
    };
  } else {
    o.owner = o.ownerId;
  }
  delete o.ownerId;

  return o;
};

export const getAllStories = async (query) => {
  const { page, perPage } = parsePagination(query);
  const { sortBy, sortOrder } = parseSort(query);
  const skip = (page - 1) * perPage;

  const filter = {};
  if (query.category) {
    if (mongoose.isValidObjectId(query.category)) {
      filter.category = query.category;
    } else {
      const cat = await CategoriesCollection.findOne({
        name: query.category,
      }).lean();
      filter.category = cat ? cat._id : '__no_match__';
    }
  }

  const findQ = storyModel
    .find(filter)
    .populate('category', 'name')
    .populate('ownerId', 'name avatarUrl description')
    .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
    .skip(skip)
    .limit(perPage);

  const [total, stories] = await Promise.all([
    storyModel.countDocuments(filter),
    findQ,
  ]);

  const data = stories.map(mapDoc);

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
    .populate('ownerId', 'name avatarUrl description');

  if (!doc) return null;
  return mapDoc(doc);
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
