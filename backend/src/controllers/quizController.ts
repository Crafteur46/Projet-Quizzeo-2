import { Request, Response, NextFunction } from 'express';
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
    correctAnswer: 1 | 2 | 3 | 4;
    creatorId: number;
} & Record<AnswerKey, string>;

// Thèmes
export const createTheme = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { name } = req.body;
    if (!name) {
        res.status(400).json({ error: 'Le nom du thème est requis.' });
        return;
    }
    try {
        const theme = await prisma.theme.create({ data: { name } });
        res.status(201).json(theme);
    } catch (error) {
        res.status(500).json({ error: 'La création du thème a échoué.' });
    }
};

export const getThemes = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const themes = await prisma.theme.findMany();
        res.json(themes);
    } catch (error) {
        res.status(500).json({ error: 'La récupération des thèmes a échoué.' });
    }
};

export const updateTheme = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) {
        res.status(400).json({ error: 'Le nom du thème est requis.' });
        return;
    }
    try {
        const theme = await prisma.theme.update({
            where: { id: Number(id) },
            data: { name },
        });
        res.json(theme);
    } catch (error) {
        res.status(500).json({ error: 'La mise à jour du thème a échoué.' });
    }
};

export const deleteTheme = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    try {
        await prisma.theme.delete({ where: { id: Number(id) } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'La suppression du thème a échoué.' });
    }
};

// Questions
export const createQuestion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.currentUser) {
        res.status(401).json({ error: 'Utilisateur non authentifié.' });
        return;
    }
    
    const { label, answer1, answer2, answer3, answer4, correctAnswer, themeId } = req.body;
    const creatorId = req.currentUser.id;

    if (!label || !answer1 || !answer2 || !answer3 || !answer4 || !correctAnswer || !themeId) {
        res.status(400).json({ error: 'Tous les champs sont requis pour créer une question.' });
        return;
    }

    try {
        const question = await prisma.question.create({
            data: { label, answer1, answer2, answer3, answer4, correctAnswer, themeId, creatorId },
        });
        res.status(201).json(question);
    } catch (error) {
        res.status(500).json({ error: 'La création de la question a échoué.' });
    }
};

export const getQuestionsByTheme = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { themeId } = req.query;
    if (!themeId) {
        res.status(400).json({ error: "L'ID du thème est requis." });
        return;
    }
    try {
        const questions = await prisma.question.findMany({ where: { themeId: Number(themeId) } });
        res.json(questions);
    } catch (error) {
        res.status(500).json({ error: 'La récupération des questions a échoué.' });
    }
};

// Quizzes
export const createQuiz = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { themeName, questions } = req.body;

    if (!req.currentUser) {
        res.status(401).json({ error: 'Utilisateur non authentifié.' });
        return;
    }
    const creatorId = req.currentUser.id;

    if (!themeName || !questions || !Array.isArray(questions) || questions.length !== 10) {
        res.status(400).json({ error: 'Un quiz doit avoir un nom de thème et 10 questions.' });
        return;
    }

    for (const q of questions) {
        if (!q.label || !q.answer1 || !q.answer2 || !q.answer3 || !q.answer4 || !q.correctAnswer) {
            res.status(400).json({ error: 'Chaque question doit avoir un libellé, 4 réponses et une réponse correcte.' });
            return;
        }
    }

    try {
        const newQuiz = await prisma.$transaction(async (tx) => {
            const newTheme = await tx.theme.create({
                data: { name: themeName },
            });

            const createdQuestions = await Promise.all(
                questions.map((q: any) =>
                    tx.question.create({
                        data: {
                            label: q.label,
                            answer1: q.answer1,
                            answer2: q.answer2,
                            answer3: q.answer3,
                            answer4: q.answer4,
                            correctAnswer: q.correctAnswer,
                            themeId: newTheme.id,
                            creatorId: creatorId,
                        },
                    })
                )
            );

            const questionIds = createdQuestions.map((q) => ({ id: q.id }));

            const quiz = await tx.quiz.create({
                data: {
                    themeId: newTheme.id,
                    creatorId: creatorId,
                    questions: {
                        connect: questionIds,
                    },
                },
                include: {
                    questions: true,
                    theme: true,
                },
            });

            return quiz;
        });

        res.status(201).json(newQuiz);
    } catch (error) {
        console.error('Erreur lors de la création du quiz :', error);
        res.status(500).json({ error: 'La création du quiz a échoué.' });
    }
};

export const getQuizzes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.currentUser) {
        res.status(401).json({ error: 'Utilisateur non authentifié.' });
        return;
    }
    const { themeId } = req.query;
    try {
        const quizzes = await prisma.quiz.findMany({
            where: { themeId: themeId ? Number(themeId) : undefined },
            include: {
                theme: true,
                creator: {
                    select: {
                        id: true,
                        email: true,
                    },
                },
                _count: {
                    select: { questions: true },
                },
            },
        });
        res.json(quizzes);
    } catch (error) {
        console.error('Erreur lors de la récupération des quizzes :', error);
        res.status(500).json({ error: 'La récupération des quizzes a échoué.' });
    }
};

export const getCreatedQuizzes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.currentUser) {
        res.status(401).json({ error: 'Utilisateur non authentifié.' });
        return;
    }
    const creatorId = req.currentUser.id;

    try {
        const quizzes = await prisma.quiz.findMany({
            where: {
                creatorId: creatorId,
            },
            include: {
                theme: true, // Include theme information
                _count: {
                    select: { questions: true },
                },
            },
        });
        const quizzesWithQuestionCount = quizzes.map(quiz => ({
            ...quiz,
            questionCount: quiz._count.questions,
        }));

        res.json(quizzesWithQuestionCount);
    } catch (error) {
        res.status(500).json({ error: 'La récupération des quizzes créés a échoué.' });
    }
};

export const getQuizById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    try {
        const quiz = await prisma.quiz.findUnique({
            where: { id: Number(id) },
            include: { 
                questions: true,
                theme: true
            },
        });

        if (!quiz) {
            res.status(404).json({ error: 'Quiz non trouvé.' });
            return;
        }

        // Transform questions to match frontend expectations
        const transformedQuestions = quiz.questions.map(q => {
            const question = q as QuestionWithAnswers;
            return {
                id: question.id,
                label: question.label,
                answers: [
                    { id: 1, text: question.answer1 },
                    { id: 2, text: question.answer2 },
                    { id: 3, text: question.answer3 },
                    { id: 4, text: question.answer4 },
                ],
            };
        });

        const responseQuiz = {
            ...quiz,
            questions: transformedQuestions,
        };

        res.json(responseQuiz);

    } catch (error) {
        res.status(500).json({ error: 'La récupération du quiz a échoué.' });
    }
};

// Game Logic
export const submitAnswer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { quizId, questionId, mode, answerId, answerText } = req.body;

    if (!req.currentUser) {
        res.status(401).json({ error: 'Authentification requise.' });
        return;
    }

    if (!quizId || !questionId || !mode) {
        res.status(400).json({ error: 'Les IDs de quiz et de question, ainsi que le mode, sont requis.' });
        return;
    }

    const userId = req.currentUser.id;

    try {
        const question = await prisma.question.findUnique({ where: { id: questionId } }) as QuestionWithAnswers | null;
        if (!question) {
            res.status(404).json({ error: 'Question non trouvée.' });
            return;
        }

        let score = 0;
        let isCorrect = false;
        const correctAnswerKey = `answer${question.correctAnswer}` as AnswerKey;
        const correctAnswerText = question[correctAnswerKey];

        switch (mode) {
            case 'cash':
                if (typeof answerText !== 'string') {
                    res.status(400).json({ error: 'La réponse textuelle est requise pour le mode "cash".' });
                    return;
                }
                const similarity = stringSimilarity.compareTwoStrings(answerText.toLowerCase(), correctAnswerText.toLowerCase());
                if (similarity >= 0.9) {
                    score = 5;
                    isCorrect = true;
                }
                break;
            case 'carré':
                if (typeof answerId !== 'number') {
                    res.status(400).json({ error: 'L\'ID de la réponse est requis pour le mode "carré".' });
                    return;
                }
                if (answerId === question.correctAnswer) {
                    score = 3;
                    isCorrect = true;
                }
                break;
            case 'duo':
                if (typeof answerId !== 'number') {
                    res.status(400).json({ error: 'L\'ID de la réponse est requis pour le mode "duo".' });
                    return;
                }
                if (answerId === question.correctAnswer) {
                    score = 1;
                    isCorrect = true;
                }
                break;
            default:
                res.status(400).json({ error: `Mode de jeu invalide : ${mode}` });
                return;
        }

        if (isCorrect) {
            await prisma.score.create({
                data: { score, userId, quizId },
            });
        }

        res.json({ isCorrect, score, correctAnswer: correctAnswerText });

    } catch (error) {
        console.error("Erreur lors de la soumission de la réponse :", error);
        res.status(500).json({ error: 'La soumission de la réponse a échoué.' });
    }
};

// Hall of Fame
export const getQuizHallOfFame = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    try {
        const scores = await prisma.score.groupBy({
            by: ['userId'],
            where: { quizId: Number(id) },
            _sum: { score: true },
            orderBy: { _sum: { score: 'desc' } },
            take: 10,
        });

        const userIds = scores.map(s => s.userId);
        const users = await prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, email: true } });
        const userMap = new Map(users.map(u => [u.id, u.email]));

        const hallOfFame = scores.map(s => ({ email: userMap.get(s.userId) || 'Utilisateur inconnu', score: s._sum.score || 0 }));

        res.json(hallOfFame);
    } catch (error) {
        res.status(500).json({ error: 'La récupération du hall of fame du quiz a échoué.' });
    }
};

export const getQuestionPropositions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const { mode } = req.query;

    if (mode !== 'duo') {
        res.status(400).json({ error: 'Ce mode n\'est pas supporté pour la récupération de propositions.' });
        return;
    }

    try {
        const question = await prisma.question.findUnique({ where: { id: Number(id) } }) as QuestionWithAnswers | null;
        if (!question) {
            res.status(404).json({ error: 'Question non trouvée.' });
            return;
        }

        const correctAnswerId = question.correctAnswer;
        const allAnswers = [
            { id: 1, text: question.answer1 },
            { id: 2, text: question.answer2 },
            { id: 3, text: question.answer3 },
            { id: 4, text: question.answer4 },
        ];

        const correctAnswer = allAnswers.find(a => a.id === correctAnswerId);
        const incorrectAnswers = allAnswers.filter(a => a.id !== correctAnswerId);
        
        if (!correctAnswer) {
            res.status(500).json({ error: 'Configuration de la question invalide.' });
            return;
        }

        // Shuffle incorrect answers and pick one
        const randomIncorrectAnswer = incorrectAnswers[Math.floor(Math.random() * incorrectAnswers.length)];

        // Shuffle the final duo
        const duoPropositions = [correctAnswer, randomIncorrectAnswer].sort(() => Math.random() - 0.5);

        res.json(duoPropositions);

    } catch (error) {
        console.error("Erreur lors de la récupération des propositions :", error);
        res.status(500).json({ error: 'La récupération des propositions a échoué.' });
    }
};

// Hall of Fame
export const getGlobalHallOfFame = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const scores = await prisma.score.groupBy({
            by: ['userId'],
            _sum: { score: true },
            orderBy: { _sum: { score: 'desc' } },
            take: 10,
        });

        const userIds = scores.map(s => s.userId);
        const users = await prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, email: true } });
        const userMap = new Map(users.map(u => [u.id, u.email]));

        const hallOfFame = scores.map(s => ({ email: userMap.get(s.userId) || 'Utilisateur inconnu', score: s._sum.score || 0 }));

        res.json(hallOfFame);
    } catch (error) {
        res.status(500).json({ error: 'La récupération du hall of fame global a échoué.' });
    }
};
