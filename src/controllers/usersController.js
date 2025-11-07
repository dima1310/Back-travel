import { User } from '../models/userModel.js';
import Article from '../models/articleModel.js';

//  1. Публічний ендпоінт — отримати список користувачів (авторів) + пагінація
export const getUsers = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const users = await User.find()
            .select('name email avatarURL')
            .skip(skip)
            .limit(limit);

        const total = await User.countDocuments();

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

//  2. Публічний ендпоінт — отримати користувача за ID + список його статей
export const getUserById = async (req, res, next) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId).select('name email avatarURL');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const articles = await Article.find({ author: userId }).select(
            'title summary publishedAt'
        );

        res.status(200).json({ user, articles });
    } catch (error) {
        next(error);
    }
};

//  3. Приватний ендпоінт — отримати інформацію про поточного користувача
export const getCurrentUser = async (req, res, next) => {
    try {
        const { id } = req.user;
        const user = await User.findById(id).select('name email avatarURL savedArticles');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
};

//  4. Приватний ендпоінт — додати статтю до збережених статей
export const addSavedArticle = async (req, res, next) => {
    try {
        const { articleId } = req.params;
        const { id } = req.user;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.savedArticles.includes(articleId)) {
            return res.status(400).json({ message: 'Article already saved' });
        }

        user.savedArticles.push(articleId);
        await user.save();

        res.status(200).json({ message: 'Article added to saved list' });
    } catch (error) {
        next(error);
    }
};

//  5. Приватний ендпоінт — видалити статтю зі збережених
export const removeSavedArticle = async (req, res, next) => {
    try {
        const { articleId } = req.params;
        const { id } = req.user;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.savedArticles = user.savedArticles.filter(
            (a) => a.toString() !== articleId
        );
        await user.save();

        res.status(200).json({ message: 'Article removed from saved list' });
    } catch (error) {
        next(error);
    }
};

//  6. Приватний ендпоінт — оновлення аватару користувача
export const updateAvatar = async (req, res, next) => {
    try {
        const { id } = req.user;
        const { avatarURL } = req.body;

        if (!avatarURL) {
            return res.status(400).json({ message: 'avatarURL is required' });
        }

        const user = await User.findByIdAndUpdate(
            id,
            { avatarURL },
            { new: true }
        ).select('name email avatarURL');

        res.status(200).json({
            message: 'Avatar updated successfully',
            user,
        });
    } catch (error) {
        next(error);
    }
};

//  7. Приватний ендпоінт — оновлення даних користувача
export const updateUser = async (req, res, next) => {
    try {
        const { id } = req.user;
        const { name, email } = req.body;

        const user = await User.findByIdAndUpdate(
            id,
            { name, email },
            { new: true }
        ).select('name email avatarURL');

        res.status(200).json({
            message: 'User data updated successfully',
            user,
        });
    } catch (error) {
        next(error);
    }
};
