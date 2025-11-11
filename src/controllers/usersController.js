import { UserCollection } from '../models/userModel.js';
import storyModel from '../models/storyModel.js';
import createHttpError from 'http-errors';

// GET /users
export const getUsers = async (req, res, next) => {
  try {
    const page = Number.parseInt(req.query.page) || 1;
    const perPage = Number.parseInt(req.query.limit) || 10;
    const skip = (page - 1) * perPage;

    const [total, users] = await Promise.all([
      UserCollection.countDocuments(),
      UserCollection.find()
        .select('name email avatar bio')
        .skip(skip)
        .limit(perPage)
        .lean(),
    ]);

    res.status(200).json({
      status: 200,
      message: 'Successfully found users!',
      data: {
        users,
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /users/:userId
export const getUserById = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await UserCollection.findById(userId)
      .select('name email avatar bio socialLinks')
      .lean();
    if (!user) throw createHttpError(404, 'User not found');

    const stories = await storyModel
      .find({ ownerId: userId })
      .select('title description img date favoriteCount category ownerId')
      .populate('category', 'name')
      .lean();

    const mapped = stories.map((s) => {
      s.owner = {
        _id: userId,
        name: user.name,
        avatar: user.avatar,
        bio: user.bio,
      };
      delete s.ownerId;
      return s;
    });

    res.status(200).json({
      status: 200,
      message: 'Successfully found user and stories!',
      data: { user, stories: mapped },
    });
  } catch (error) {
    next(error);
  }
};

// GET /users/current
export const getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;

    const user = await UserCollection.findById(userId)
      .select('name email avatar bio savedStories settings socialLinks')
      .populate({
        path: 'savedStories',
        model: 'story',
        select: 'title img date favoriteCount',
      })
      .lean();

    if (!user) throw createHttpError(404, 'User not found');

    res.status(200).json({
      status: 200,
      message: 'Successfully found current user!',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// POST /users/saved/:articleId
export const addSavedArticle = async (req, res, next) => {
  try {
    const { articleId } = req.params; // storyId фактически
    const userId = req.user._id || req.user.id;

    const user = await UserCollection.findById(userId);
    if (!user) throw createHttpError(404, 'User not found');

    if (user.savedStories.some((id) => id.toString() === articleId)) {
      return res
        .status(400)
        .json({ status: 400, message: 'Article already saved' });
    }

    user.savedStories.push(articleId);
    await user.save();

    await storyModel.findByIdAndUpdate(articleId, {
      $inc: { favoriteCount: 1 },
    });

    res
      .status(200)
      .json({ status: 200, message: 'Article added to saved list' });
  } catch (error) {
    next(error);
  }
};

// DELETE /users/saved/:articleId
export const removeSavedArticle = async (req, res, next) => {
  try {
    const { articleId } = req.params;
    const userId = req.user._id || req.user.id;

    const user = await UserCollection.findById(userId);
    if (!user) throw createHttpError(404, 'User not found');

    const before = user.savedStories.length;
    user.savedStories = user.savedStories.filter(
      (id) => id.toString() !== articleId,
    );
    if (user.savedStories.length === before) {
      return res
        .status(404)
        .json({ status: 404, message: 'Article was not in saved list' });
    }

    await user.save();
    await storyModel.findByIdAndUpdate(articleId, {
      $inc: { favoriteCount: -1 },
    });

    res
      .status(200)
      .json({ status: 200, message: 'Article removed from saved list' });
  } catch (error) {
    next(error);
  }
};

// PATCH /users/avatar
export const updateAvatar = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;

    let avatarUrl = req.body.avatar;
    if (req.file) {
      const { saveFileToCloudinary } = await import(
        '../utils/saveFileToCloudinary.js'
      );
      avatarUrl = await saveFileToCloudinary(req.file);
    }
    if (!avatarUrl)
      return res
        .status(400)
        .json({ status: 400, message: 'Avatar is required' });

    const user = await UserCollection.findByIdAndUpdate(
      userId,
      { avatar: avatarUrl },
      { new: true, runValidators: true },
    ).select('name email avatar');

    res.status(200).json({
      status: 200,
      message: 'Avatar updated successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /users/update
export const updateUser = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const patch = {};
    if (typeof req.body.name === 'string') patch.name = req.body.name.trim();
    if (typeof req.body.email === 'string') patch.email = req.body.email.trim();
    if (typeof req.body.bio === 'string') patch.bio = req.body.bio.trim();
    if (req.body.socialLinks) patch.socialLinks = req.body.socialLinks;

    const user = await UserCollection.findByIdAndUpdate(userId, patch, {
      new: true,
      runValidators: true,
    }).select('name email avatar bio socialLinks');

    res.status(200).json({
      status: 200,
      message: 'User data updated successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
