import { Request, Response, NextFunction } from 'express';
import { PrismaClient, Question } from '@prisma/client';

const prisma = new PrismaClient();

// =================================================================
// Thèmes
// =================================================================

export const createTheme = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const theme = await prisma.theme.create({ data: req.body });
        res.status(201).json(theme);
    } catch (error) {
        next(error);
    }
};

export const getThemes = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const themes = await prisma.theme.findMany();
        res.json(themes);
    } catch (error) {
        next(error);
    }
};

export const updateTheme = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const theme = await prisma.theme.update({
            where: { id: Number(req.params.id) },
            data: req.body,
        });
        res.json(theme);
    } catch (error) {
        next(error);
    }
};

export const deleteTheme = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        await prisma.theme.delete({ where: { id: Number(req.params.id) } });
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

// =================================================================
// Questions
// =================================================================

export const createQuestion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.currentUser) {
        res.status(401).json({ error: 'Utilisateur non authentifié.' });
        return;
    }
    try {
        const question = await prisma.question.create({
            data: { ...req.body, creatorId: req.currentUser.id },
        });
        res.status(201).json(question);
    } catch (error) {
        next(error);
    }
};

export const getQuestionsByTheme = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const questions = await prisma.question.findMany({ where: { themeId: Number(req.query.themeId) } });
        res.json(questions);
    } catch (error) {
        next(error);
    }
};

export const getCreatedQuestions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.currentUser) {
        res.status(401).json({ error: 'Utilisateur non authentifié.' });
        return;
    }
    try {
        const questions = await prisma.question.findMany({
            where: { creatorId: req.currentUser.id },
            include: { theme: true },
        });
        res.json(questions);
    } catch (error) {
        next(error);
    }
};

export const updateQuestion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.currentUser) {
        res.status(401).json({ error: 'Utilisateur non authentifié.' });
        return;
    }
    try {
        const question = await prisma.question.findUnique({ where: { id: Number(req.params.id) } });
        if (!question || question.creatorId !== req.currentUser.id) {
            res.status(403).json({ error: 'Action non autorisée.' });
            return;
        }
        const updatedQuestion = await prisma.question.update({
            where: { id: Number(req.params.id) },
            data: req.body,
        });
        res.json(updatedQuestion);
    } catch (error) {
        next(error);
    }
};

export const deleteQuestion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.currentUser) {
        res.status(401).json({ error: 'Utilisateur non authentifié.' });
        return;
    }
    try {
        const question = await prisma.question.findUnique({ where: { id: Number(req.params.id) } });
        if (!question || question.creatorId !== req.currentUser.id) {
            res.status(403).json({ error: 'Action non autorisée.' });
            return;
        }
        await prisma.question.delete({ where: { id: Number(req.params.id) } });
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

export const getQuestionPropositions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const question = await prisma.question.findUnique({
            where: { id: Number(req.params.id) },
            select: { id: true, label: true, answer1: true, answer2: true, answer3: true, answer4: true },
        });
        if (!question) {
            res.status(404).json({ error: 'Question non trouvée.' });
            return;
        }
        res.json(question);
    } catch (error) {
        next(error);
    }
};

// =================================================================
// Quizzes
// =================================================================

export const createQuiz = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { title, theme, questions } = req.body as { title: string; theme: string; questions: Question[] };
    if (!req.currentUser) {
        res.status(401).json({ error: 'Utilisateur non authentifié.' });
        return;
    }
    try {
        const newQuiz = await prisma.$transaction(async (tx) => {
            const newTheme = await tx.theme.upsert({ where: { name: theme }, update: {}, create: { name: theme } });
            const createdQuestions = await Promise.all(
                questions.map((q) => tx.question.create({ data: { ...q, themeId: newTheme.id, creatorId: req.currentUser!.id } }))
            );
            const quiz = await tx.quiz.create({
                data: {
                    title,
                    themeId: newTheme.id,
                    creatorId: req.currentUser!.id,
                    questions: { connect: createdQuestions.map((q) => ({ id: q.id })) },
                },
                include: { questions: true, theme: true },
            });
            return quiz;
        });
        res.status(201).json(newQuiz);
    } catch (error) {
        next(error);
    }
};

export const getQuizzes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const quizzes = await prisma.quiz.findMany({
            where: { themeId: req.query.themeId ? Number(req.query.themeId) : undefined },
            include: { theme: true, creator: { select: { id: true, email: true } }, _count: { select: { questions: true } } },
        });
        res.json(quizzes);
    } catch (error) {
        next(error);
    }
};

export const getCreatedQuizzes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.currentUser) {
        res.status(401).json({ error: 'Utilisateur non authentifié.' });
        return;
    }
    try {
        const quizzes = await prisma.quiz.findMany({
            where: { creatorId: req.currentUser.id },
            include: { theme: true, _count: { select: { questions: true } } },
        });
        res.json(quizzes);
    } catch (error) {
        next(error);
    }
};

export const getQuizById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const quiz = await prisma.quiz.findUnique({
            where: { id: Number(req.params.id) },
            include: {
                questions: { select: { id: true, label: true, answer1: true, answer2: true, answer3: true, answer4: true } },
                theme: true,
                creator: { select: { id: true, email: true } },
            },
        });
        if (!quiz) {
            res.status(404).json({ error: 'Quiz non trouvé.' });
            return;
        }
        res.json(quiz);
    } catch (error) {
        next(error);
    }
};

export const updateQuiz = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { title, themeId, questionIds } = req.body;
    if (!req.currentUser) {
        res.status(401).json({ error: 'Utilisateur non authentifié.' });
        return;
    }
    try {
        const quiz = await prisma.quiz.findUnique({ where: { id: Number(req.params.id) } });
        if (!quiz || quiz.creatorId !== req.currentUser.id) {
            res.status(403).json({ error: 'Action non autorisée.' });
            return;
        }
        const updatedQuiz = await prisma.quiz.update({
            where: { id: Number(req.params.id) },
            data: {
                title,
                theme: themeId ? { connect: { id: themeId } } : undefined,
                questions: questionIds ? { set: questionIds.map((id: number) => ({ id })) } : undefined,
            },
        });
        res.json(updatedQuiz);
    } catch (error) {
        next(error);
    }
};

export const deleteQuiz = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.currentUser) {
        res.status(401).json({ error: 'Utilisateur non authentifié.' });
        return;
    }
    try {
        const quiz = await prisma.quiz.findUnique({ where: { id: Number(req.params.id) } });
        if (!quiz || quiz.creatorId !== req.currentUser.id) {
            res.status(403).json({ error: 'Action non autorisée.' });
            return;
        }
        await prisma.quiz.delete({ where: { id: Number(req.params.id) } });
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

// =================================================================
// Jeu & Scores
// =================================================================

export const submitAnswer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.currentUser) {
        res.status(401).json({ error: 'Utilisateur non authentifié.' });
        return;
    }
    const { quizId, questionId, answer } = req.body;
    try {
        const question = await prisma.question.findUnique({ where: { id: questionId } });
        if (!question) {
            res.status(404).json({ error: 'Question non trouvée.' });
            return;
        }
        const isCorrect = question.correctAnswer === answer;
        const scoreToUpdate = isCorrect ? 10 : 0;

        const score = await prisma.score.upsert({
            where: { userId_quizId: { userId: req.currentUser.id, quizId } },
            update: { score: { increment: scoreToUpdate } },
            create: { score: scoreToUpdate, userId: req.currentUser.id, quizId },
        });
        res.status(200).json({ correct: isCorrect, score: score.score });
    } catch (error) {
        next(error);
    }
};

// =================================================================
// Hall of Fame
// =================================================================

export const getGlobalHallOfFame = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const topScores = await prisma.score.groupBy({
            by: ['userId'],
            _sum: { score: true },
            orderBy: { _sum: { score: 'desc' } },
            take: 10,
        });
        const users = await prisma.user.findMany({
            where: { id: { in: topScores.map((s) => s.userId) } },
            select: { id: true, email: true },
        });
        const userMap = new Map(users.map((u) => [u.id, u.email]));
        const hallOfFame = topScores.map((s) => ({
            userId: s.userId,
            email: userMap.get(s.userId),
            totalScore: s._sum.score,
        }));
        res.json(hallOfFame);
    } catch (error) {
        next(error);
    }
};

export const getQuizHallOfFame = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const topScores = await prisma.score.findMany({
            where: { quizId: Number(req.params.id) },
            orderBy: { score: 'desc' },
            take: 10,
            include: { user: { select: { id: true, email: true } } },
        });
        res.json(topScores);
    } catch (error) {
        next(error);
    }
};