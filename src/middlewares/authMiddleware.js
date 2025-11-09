import jwt from 'jsonwebtoken';
import { UserCollection } from '../models/userModel.js';

const { JWT_SECRET = 'your_jwt_secret' } = process.env;

export const authMiddleware = async (req, res, next) => {
    try {
        const header = req.get('Authorization') || '';
        const [type, token] = header.split(' ');

        if (type !== 'Bearer' || !token) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        let payload;
        try {
            payload = jwt.verify(token, JWT_SECRET);
        } catch (error) {
            console.error('JWT verification failed:', error.message);
            return res.status(401).json({ message: 'Invalid token' });
        }

        const user = await UserCollection.findById(payload.id);
        if (!user) return res.status(401).json({ message: 'User not found' });

        req.user = { id: user._id, email: user.email, name: user.name };
        next();
    } catch (error) {
        next(error);
    }
};
