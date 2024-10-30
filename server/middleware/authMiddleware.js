import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/dotenv.js';

export const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;
    console.log(token)

    if (!token) {
        return res.status(401).json({
            message: 'Access denied. No token provided.',
            success: false,
            data: [],
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; 
        next(); 
    } catch (error) {
        console.error('Invalid token:', error);
        res.status(400).json({
            message: 'Invalid token.',
            success: false,
            data: [],
        });
    }
};
