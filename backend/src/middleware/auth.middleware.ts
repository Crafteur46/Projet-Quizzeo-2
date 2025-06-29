import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Access denied. No token provided.' });
        return;
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: number };
        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

        if (!user) {
            res.status(401).json({ error: 'Invalid token: user not found.' });
            return;
        }

        req.currentUser = user;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token.' });
        return;
    }
};
