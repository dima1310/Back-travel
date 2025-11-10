import createHttpError from 'http-errors';
import '../models/categories.js';
import { getAllStories, getStoryById, createStory, updateStory, deleteStory } from '../services/story.js';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';
import { CategoriesCollection } from '../models/categories.js';

export const getStoriesController = async (req, res, next) => {
    try {
        const stories = await getAllStories(req.query);

        res.json({
            status: 200,
            message: 'Successfully found stories.',
            data: stories,
        });
    } catch (err) {
        next(err);
    }
};

export const getStoryByIdController = async (req, res, next) => {
    try {
        const { storyId } = req.params;
        const story = await getStoryById(storyId);

        if (!story) {
            throw createHttpError(404, 'Story not found');
        }

        res.json({
            status: 200,
            message: `Successfuly found story with id ${storyId}`,
            data: story,
        });
    } catch (err) {
        next(err);
    }
};

export const createStoryController = async (req, res, next) => {
    try {
        const payload = { ...req.body };

        if (req.file) {
            payload.img = await saveFileToCloudinary(req.file);
        }  else {
            throw createHttpError(400, 'Зображення є обов’язковим');
        }

        const categoryName = await CategoriesCollection.findOne({ name: payload.category });
        if (!categoryName) {
            throw createHttpError(400, `Категорія "${payload.category}" не знайдена`);
        }
        payload.category = categoryName._id;
        payload.ownerId = req.user._id;

        const story = await createStory(payload);

        res.status(201).json({
            status: 201,
            message: 'Successfully created a story',
            data: story,
        });
    } catch (err) {
        next(err);
    }
};

export const patchStoryController = async (req, res, next) => {
    try {
        const { storyId } = req.params;
        const payload = { ...req.body };

        if (req.file) {
            payload.img = await saveFileToCloudinary(req.file);
        }


        const categoryName = await CategoriesCollection.findOne({ name: payload.category });
        if (!categoryName) {
            throw createHttpError(400, `Категорія "${payload.category}" не знайдена`);
        }
        payload.category = categoryName._id;
        payload.ownerId = req.user._id;

        const updated = await updateStory(storyId, payload, req.user);

        if (!updated) {
            throw createHttpError(404, 'Story not found');
        }

        res.status(200).json({
            status: 200,
            message: `Successfully updated story with id ${storyId}`,
            data: updated,
        });
    } catch (err) {
        next(err);
    }
};

export const deleteStoryController = async (req, res, next) => {
    try {
        const { storyId } = req.params;

        const deleted = await deleteStory(storyId, req.user);

        if (!deleted) {
            throw createHttpError(404, 'Story not found');
        }

        res.status(204).send();
    } catch (err) {
        next(err);
    }
};
