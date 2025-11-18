import createHttpError from 'http-errors';
import { SeedUser } from '../models/seedUserModel.js';
import { UserCollection } from '../models/userModel.js';
import storyModel from '../models/storyModel.js';

const toInt = (val, def) => {
  const n = parseInt(val, 10);
  return Number.isFinite(n) && n > 0 ? n : def;
};

export const getUsers = async (req, res, next) => {
  try {
    const page = toInt(req.query.page, 1);
    const perPage = Math.min(toInt(req.query.limit, 10), 50);
    const skip = (page - 1) * perPage;

    const [total, usersRaw] = await Promise.all([
      SeedUser.countDocuments(),
      SeedUser.find().sort({ name: 1 }).skip(skip).limit(perPage).lean(),
    ]);

    const users = usersRaw.map((u) => ({
      _id: u._id,
      name: u.name,
      email: '', // в сид-сущности нет email
      avatar: u.avatarUrl ?? '',
      bio: u.description ?? '',
    }));

    res.json({
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

export const getUserById = async (req, res, next) => {
  try {
    const { userId } = req.params;
    let u = await SeedUser.findById(userId).lean();
    let fromRealUsers = false;

    if (!u) {
      const real = await UserCollection.findById(userId)
        .select('name email avatar bio socialLinks')
        .lean();

      if (!real) throw createHttpError(404, 'User not found');

      u = {
        _id: real._id,
        name: real.name,
        email: real.email,
        avatarUrl: real.avatar,
        description: real.bio,
        socialLinks: real.socialLinks ?? {},
      };
      fromRealUsers = true;
    }

    const user = {
      _id: u._id,
      name: u.name,
      email: u.email ?? '',
      avatar: u.avatarUrl ?? '',
      bio: u.description ?? '',
      socialLinks: u.socialLinks ?? {},
    };

    // истории для этого пользователя (логика одна и та же)
    const stories = await storyModel
      .find({ ownerId: userId })
      .select('title description article img date favoriteCount category ownerId')
      .populate('category', 'name')
      .lean();

    const mapped = stories.map((s) => ({
      _id: s._id,
      img: s.img,
      title: s.title,
      description: s.description ?? s.article ?? '',
      date: s.date,
      favoriteCount: s.favoriteCount ?? 0,
      category: s.category,
      owner: {
        _id: userId,
        name: user.name,
        avatar: user.avatar,
        bio: user.bio,
      },
    }));

    res.json({
      status: 200,
      message: 'Successfully found user and stories!',
      data: { user, articles: mapped },
    });
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) throw createHttpError(401, 'Unauthorized');

    const user = await UserCollection.findById(userId)
      .select('name email avatar bio savedStories settings socialLinks')
      .lean();

    if (!user) throw createHttpError(404, 'User not found');
    
    const savedStories = Array.isArray(user.savedStories)
      ? user.savedStories.map((id) => id.toString())
      : [];

    res.json({
      status: 200,
      message: 'Successfully found current user!',
      data: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        settings: user.settings,
        socialLinks: user.socialLinks,
        savedStories,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) throw createHttpError(401, 'Unauthorized');

    const patch = {};
    if (typeof req.body.name === 'string') patch.name = req.body.name.trim();
    if (typeof req.body.email === 'string') patch.email = req.body.email.trim();
    if (typeof req.body.bio === 'string') patch.bio = req.body.bio.trim();
    if (req.body.socialLinks) patch.socialLinks = req.body.socialLinks;

    const user = await UserCollection.findByIdAndUpdate(userId, patch, {
      new: true,
      runValidators: true,
    }).select('name email avatar bio socialLinks');

    if (!user) throw createHttpError(404, 'User not found');

    res.json({
      status: 200,
      message: 'User data updated successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAvatar = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) throw createHttpError(401, 'Unauthorized');

    let avatarUrl = req.body.avatar;
    if (req.file) {
      const { saveFileToCloudinary } = await import(
        '../utils/saveFileToCloudinary.js'
      );
      avatarUrl = await saveFileToCloudinary(req.file);
    }
    if (!avatarUrl) {
      throw createHttpError(400, 'Avatar is required');
    }

    const user = await UserCollection.findByIdAndUpdate(
      userId,
      { avatar: avatarUrl },
      { new: true, runValidators: true },
    ).select('name email avatar');

    if (!user) throw createHttpError(404, 'User not found');

    res.json({
      status: 200,
      message: 'Avatar updated successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const addSavedArticle = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) throw createHttpError(401, 'Unauthorized');

    const { id: articleId } = req.params;

    const user = await UserCollection.findById(userId);
    if (!user) throw createHttpError(404, 'User not found');

    if (user.savedStories.some((sid) => sid.toString() === articleId)) {
      return res
        .status(400)
        .json({ status: 400, message: 'Article already saved' });
    }

    user.savedStories.push(articleId);
    await user.save();

    await storyModel.findByIdAndUpdate(articleId, {
      $inc: { favoriteCount: 1 },
    });

    res.json({ status: 200, message: 'Article added to saved list' });
  } catch (error) {
    next(error);
  }
};

export const removeSavedArticle = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) throw createHttpError(401, 'Unauthorized');

    const { id: articleId } = req.params;

    const user = await UserCollection.findById(userId);
    if (!user) throw createHttpError(404, 'User not found');

    const before = user.savedStories.length;
    user.savedStories = user.savedStories.filter(
      (sid) => sid.toString() !== articleId,
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

    res.json({ status: 200, message: 'Article removed from saved list' });
  } catch (error) {
    next(error);
  }
};
