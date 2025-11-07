import Article from '../models/articleModel.js';

// 🟢 Публічний ендпоінт — отримати всі статті (для тесту або майбутнього використання)
export const getArticles = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const articles = await Article.find()
            .populate('author', 'name email avatarURL')
            .skip(skip)
            .limit(Number(limit));

        const total = await Article.countDocuments();
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
