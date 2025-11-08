import '../models/categories.js';
import Article from '../models/articleModel.js';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';

// 🟢 Публічний ендпоінт — отримати всі статті (для тесту або майбутнього використання)
export const getArticles = async (req, res, next) => {
    try {
        const { page = 1, limit = 9, category } = req.query;
        const skip = (page - 1) * limit;

        const filter = {};
        if (category) {
            filter.category = category;
        }

        const articles = await Article.find(filter)
            .populate('category', 'name')
            .sort({ favoriteCount: - 1 })
            .skip(skip)
            .limit(Number(limit));

        const total = await Article.countDocuments(filter);
        res.status(200).json({
            total,
            page: Number(page),
            limit: Number(limit),
            articles,
        });
    } catch (error) {
        next(error);
    }
};

export const createArticle = async (req, res, next) => {
    try {
        const { title, description, category } = req.body;
        const { file } = req;

        if (!file) {
            return res.status(400).json({ message: "Зоображення обов'язкове" });
        }

        // зберегти в cloudinary
        const imageUrl = await saveFileToCloudinary(file);

        const newStory = await Article.create({
            img: imageUrl,
            title,
            article: description,
            category,
            ownerId: req.user._id,
            date: new Date(),
        });

        res.status(201).json(newStory);
    } catch (error) {
        next(error);
    }
};

export const updateArticle = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, description, category } = req.body;

        const article = await Article.findById(id);
        if (!article) {
            return res.status(404).json({ message: 'Історію не знайдено.' });
        }

        if (article.ownerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Немає користувача.' });
        }

        if (req.file) {
            const upload = await saveFileToCloudinary(req.file);
            article.img = upload;
        }

        article.title = title || article.title;
        article.article = description || article.article;
        article.category = category || article.category;
        article.date = new Date();

        await article.save();
        res.status(200).json(article);
    } catch (error) {
        next(error);
    }
};
