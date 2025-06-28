import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

declare module 'express-session' {
    interface SessionData {
        token?: string;
    }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const token = req.session?.token;

    if (!token) {
        res.status(401).json({ error: 'Access denied. No token provided.' });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: number };
        req.currentUser = { id: decoded.userId };
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token.' });
    }
};
