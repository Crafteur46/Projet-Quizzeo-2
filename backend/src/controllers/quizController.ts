import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import * as stringSimilarity from 'string-similarity';

const prisma = new PrismaClient();

type AnswerKey = 'answer1' | 'answer2' | 'answer3' | 'answer4';

type QuestionWithAnswers = {
    id: number;
    createdAt: Date;
    updatedAt: Date;
    themeId: number;
    label: string;
    answer1: string;
    answer2: string;
    answer3: string;
    answer4: string;
    correctAnswer: 1 | 2 | 3 | 4;  // More precise type for correctAnswer
    creatorId: number;
} & Record<AnswerKey, string>;  // This ensures type safety for answer access


// Thèmes
export const createTheme = async (req: Request, res: Response) => {
    const { name } = req.body;
    try {
        const theme = await prisma.theme.create({ data: { name } });
        res.status(201).json(theme);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create theme' });
    }
};

export const getThemes = async (_req: Request, res: Response) => {
    try {
        const themes = await prisma.theme.findMany();
        res.json(themes);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch themes' });
    }
};

export const updateTheme = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name } = req.body;
    try {
        const theme = await prisma.theme.update({
            where: { id: Number(id) },
            data: { name },
        });
        res.json(theme);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update theme' });
    }
};

export const deleteTheme = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await prisma.theme.delete({ where: { id: Number(id) } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete theme' });
    }
};

// Questions
export const createQuestion = async (req: Request, res: Response) => {
    if (!req.currentUser) {
        return res.status(401).json({ error: 'Non authentifié' });
    }
    
    const { label, answer1, answer2, answer3, answer4, correctAnswer, themeId } = req.body;
    const creatorId = req.currentUser.id;

    try {
        const question = await prisma.question.create({
            data: { label, answer1, answer2, answer3, answer4, correctAnswer, themeId, creatorId },
        });
        res.status(201).json(question);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create question' });
    }
};

export const getQuestionsByTheme = async (req: Request, res: Response) => {
    const { themeId } = req.query;
    if (!themeId) {
        return res.status(400).json({ error: 'Theme ID is required' });
    }
    try {
        const questions = await prisma.question.findMany({ where: { themeId: Number(themeId) } });
        res.json(questions);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch questions' });
    }
};

// Quizzes
export const createQuiz = async (req: Request, res: Response): Promise<void> => {
    const { themeId, questionIds } = req.body; // Attendre un tableau d'IDs de questions
    const creatorId = req.currentUser?.id;

    if (!themeId || !questionIds || questionIds.length !== 10) {
        res.status(400).json({ error: 'A quiz must have a theme and 10 questions.' });
        return;
    }

    if (!creatorId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
    }

    try {
        const quiz = await prisma.quiz.create({
            data: {
                themeId: Number(themeId),
                creatorId: creatorId,
                questions: { connect: questionIds.map((id: number) => ({ id: Number(id) })) },
            },
        });
        res.status(201).json(quiz);
    } catch (error) {
        console.error('Error creating quiz:', error);
        res.status(500).json({ error: 'Failed to create quiz' });
    }
};

export const getQuizzes = async (req: Request, res: Response) => {
    try {
        const quizzes = await prisma.quiz.findMany({ include: { theme: true, creator: { select: { pseudo: true } } } });
        res.json(quizzes);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch quizzes' });
    }
};

export const getQuizById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const quiz = await prisma.quiz.findUnique({
            where: { id: Number(id) },
            include: { questions: true, theme: true },
        });
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }
        res.json(quiz);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch quiz' });
    }
};

// Game Logic
export const submitAnswer = async (req: Request, res: Response) => {
    const { quizId, questionId, answer, mode } = req.body;
    
    if (!req.currentUser) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    
    const userId = req.currentUser.id;

    try {
        const question = await prisma.question.findUnique({ where: { id: questionId } }) as QuestionWithAnswers | null;
        if (!question) return res.status(404).json({ error: 'Question not found' });

        let score = 0;
        let isCorrect = false;

        // Type-safe way to access the correct answer
        const answerKey = `answer${question.correctAnswer}` as AnswerKey;
        const correctAnswerText = question[answerKey];

        switch (mode) {
            case 'cash':
                const similarity = stringSimilarity.compareTwoStrings(answer.toLowerCase(), correctAnswerText.toLowerCase());
                if (similarity >= 0.8) { // Seuil de similarité
                    score = 5;
                    isCorrect = true;
                }
                break;
            case 'carré':
                if (parseInt(answer) === question.correctAnswer) {
                    score = 3;
                    isCorrect = true;
                }
                break;
            case 'duo':
                if (parseInt(answer) === question.correctAnswer) {
                    score = 1;
                    isCorrect = true;
                }
                break;
        }

        // Enregistrer le score
        await prisma.score.create({
            data: { score, userId, quizId },
        });

        res.json({ isCorrect, score, correctAnswer: correctAnswerText });

    } catch (error) {
        res.status(500).json({ error: 'Failed to submit answer' });
    }
};

// Hall of Fame
export const getQuizHallOfFame = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const scores = await prisma.score.groupBy({
            by: ['userId'],
            where: { quizId: Number(id) },
            _sum: { score: true },
            orderBy: { _sum: { score: 'desc' } },
            take: 10,
        });

        // Enrichir avec les pseudos des utilisateurs
        const userIds = scores.map(s => s.userId);
        const users = await prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, pseudo: true } });
        const userMap = new Map(users.map(u => [u.id, u.pseudo]));

        const hallOfFame = scores.map(s => ({ pseudo: userMap.get(s.userId), score: s._sum.score }));

        res.json(hallOfFame);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get hall of fame' });
    }
};

export const getGlobalHallOfFame = async (req: Request, res: Response) => {
    try {
        const scores = await prisma.score.groupBy({
            by: ['userId'],
            _sum: { score: true },
            orderBy: { _sum: { score: 'desc' } },
            take: 10,
        });

        const userIds = scores.map(s => s.userId);
        const users = await prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, pseudo: true } });
        const userMap = new Map(users.map(u => [u.id, u.pseudo]));

        const hallOfFame = scores.map(s => ({ pseudo: userMap.get(s.userId), score: s._sum.score }));

        res.json(hallOfFame);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get global hall of fame' });
    }
};
