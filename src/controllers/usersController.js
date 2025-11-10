import { UserCollection } from '../models/userModel.js';
import storyModel from '../models/storyModel.js';

// 1. Публічний ендпоінт — отримати список користувачів (авторів) + пагінація
export const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await UserCollection.find()
      .select('name email avatarURL')
      .skip(skip)
      .limit(limit);

    const total = await UserCollection.countDocuments();

    res.status(200).json({
      total,
      page,
      totalPages: Math.ceil(total / limit),
      users,
    });
  } catch (error) {
    next(error);
  }
};

// 2. Публічний ендпоінт — отримати користувача за ID + список його статей
export const getUserById = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await UserCollection.findById(userId).select(
      'name email avatarURL',
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const story = await storyModel.find({ author: userId }).select(
      'title summary publishedAt',
    );

    res.status(200).json({ user, story });
  } catch (error) {
    next(error);
  }
};

// 3. Приватний ендпоінт — отримати інформацію про поточного користувача
export const getCurrentUser = async (req, res, next) => {
  try {
    const { id } = req.user;
    const user = await UserCollection.findById(id).select(
      'name email avatarURL savedArticles',
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

// 4. Приватний ендпоінт — додати статтю до збережених статей
export const addSavedStory = async (req, res, next) => {
  try {
    const { storyId } = req.params;
    const { id } = req.user;

    const user = await UserCollection.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.savedStories.includes(storyId)) {
      return res.status(400).json({ message: 'Story already saved' });
    }

    user.savedStories.push(storyId);
    await user.save();

    res.status(200).json({ message: 'Story added to saved list' });
  } catch (error) {
    next(error);
  }
};

// 5. Приватний ендпоінт — видалити статтю зі збережених
export const removeSavedStory = async (req, res, next) => {
  try {
    const { storyId } = req.params;
    const { id } = req.user;

    const user = await UserCollection.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.savedStories = user.savedStories.filter(
      (a) => a.toString() !== storyId,
    );
    await user.save();

    res.status(200).json({ message: 'Story removed from saved list' });
  } catch (error) {
    next(error);
  }
};

// 6. Приватний ендпоінт — оновлення аватару користувача
export const updateAvatar = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { avatar } = req.body;

    if (!avatar) {
      return res.status(400).json({ message: 'avatar is required' });
    }

    const user = await UserCollection.findByIdAndUpdate(
      id,
      { avatar },
      { new: true },
    ).select('name email avatar');

    res.status(200).json({
      message: 'Avatar updated successfully',
      user,
    });
  } catch (error) {
    next(error);
  }
};

// 7. Приватний ендпоінт — оновлення даних користувача
export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { name, email } = req.body;

    const user = await UserCollection.findByIdAndUpdate(
      id,
      { name, email },
      { new: true },
    ).select('name email avatar');

    res.status(200).json({
      message: 'User data updated successfully',
      user,
    });
  } catch (error) {
    next(error);
  }
};
