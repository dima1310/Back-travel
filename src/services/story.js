import storyModel from "../models/storyModel.js";

export const getAllStories = async (query) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 9;
    const skip = (page - 1) * limit;
    const { category } = query;

    const filter = {};
    if (category) {
        filter.category = category;
    }

    const stories = await storyModel.find(filter)
        .populate('category', 'name')
        .sort({ favoriteCount: - 1 })
        .skip(skip)
        .limit(Number(limit));

    const total = await storyModel.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    return {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        stories,
    };
};

export const getStoryById = async (storyId) => {
    const story = await storyModel.findById(storyId);
    return story;
};

export const createStory = async (payload) => {
    const story = await storyModel.create(payload);
    return story;
};

export const updateStory = async (storyId, payload, user) => {
    const story = await storyModel.findById(storyId);

    if (!story) return null;
    if (!story.ownerId.equals(user._id)) {
    throw createHttpError(403, 'Доступ заборонено');
  }

  return await storyModel.findByIdAndUpdate(storyId, payload, { new: true, runValidators: true });
}

export const deleteStory = async (storyId) => {
    const story = await storyModel.findOneAndDelete({
        _id: storyId,
    });
    return story;
};
