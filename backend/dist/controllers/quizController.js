"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQuizHallOfFame = exports.getGlobalHallOfFame = exports.submitAnswer = exports.deleteQuiz = exports.updateQuiz = exports.getQuizById = exports.getCreatedQuizzes = exports.getQuizzes = exports.createQuiz = exports.getQuestionPropositions = exports.deleteQuestion = exports.updateQuestion = exports.getCreatedQuestions = exports.getQuestionsByTheme = exports.createQuestion = exports.deleteTheme = exports.updateTheme = exports.getThemes = exports.createTheme = void 0;
const stringSimilarity = __importStar(require("string-similarity"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// =================================================================
// Thèmes
// =================================================================
const createTheme = async (req, res, next) => {
    try {
        const theme = await prisma.theme.create({ data: req.body });
        res.status(201).json(theme);
    }
    catch (error) {
        next(error);
    }
};
exports.createTheme = createTheme;
const getThemes = async (_req, res, next) => {
    try {
        const themes = await prisma.theme.findMany();
        res.json(themes);
    }
    catch (error) {
        next(error);
    }
};
exports.getThemes = getThemes;
const updateTheme = async (req, res, next) => {
    try {
        const theme = await prisma.theme.update({
            where: { id: Number(req.params.id) },
            data: req.body,
        });
        res.json(theme);
    }
    catch (error) {
        next(error);
    }
};
exports.updateTheme = updateTheme;
const deleteTheme = async (req, res, next) => {
    try {
        await prisma.theme.delete({ where: { id: Number(req.params.id) } });
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
};
exports.deleteTheme = deleteTheme;
// =================================================================
// Questions
// =================================================================
const createQuestion = async (req, res, next) => {
    if (!req.currentUser) {
        res.status(401).json({ error: 'Utilisateur non authentifié.' });
        return;
    }
    try {
        const question = await prisma.question.create({
            data: { ...req.body, creatorId: req.currentUser.id },
        });
        res.status(201).json(question);
    }
    catch (error) {
        next(error);
    }
};
exports.createQuestion = createQuestion;
const getQuestionsByTheme = async (req, res, next) => {
    try {
        const questions = await prisma.question.findMany({ where: { themeId: Number(req.query.themeId) } });
        res.json(questions);
    }
    catch (error) {
        next(error);
    }
};
exports.getQuestionsByTheme = getQuestionsByTheme;
const getCreatedQuestions = async (req, res, next) => {
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
    }
    catch (error) {
        next(error);
    }
};
exports.getCreatedQuestions = getCreatedQuestions;
const updateQuestion = async (req, res, next) => {
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
    }
    catch (error) {
        next(error);
    }
};
exports.updateQuestion = updateQuestion;
const deleteQuestion = async (req, res, next) => {
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
    }
    catch (error) {
        next(error);
    }
};
exports.deleteQuestion = deleteQuestion;
// Helper function to shuffle an array
const shuffle = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};
const getQuestionPropositions = async (req, res, next) => {
    const { mode } = req.query;
    const { id } = req.params;
    if (mode !== 'duo' && mode !== 'carré') {
        res.status(400).json({ message: "Ce mode n'est pas supporté pour cette fonctionnalité." });
        return;
    }
    try {
        const question = await prisma.question.findUnique({
            where: { id: Number(id) },
        });
        if (!question || typeof question.correctAnswer !== 'number' || !question.answer1 || !question.answer2 || !question.answer3 || !question.answer4) {
            res.status(404).json({ error: 'Question non trouvée ou mal configurée.' });
            return;
        }
        const allAnswers = [
            { id: 1, text: question.answer1 },
            { id: 2, text: question.answer2 },
            { id: 3, text: question.answer3 },
            { id: 4, text: question.answer4 },
        ];
        const correctAnswer = allAnswers.find(a => a.id === question.correctAnswer);
        const incorrectAnswers = allAnswers.filter(a => a.id !== question.correctAnswer);
        if (!correctAnswer) {
            res.status(500).json({ error: 'Configuration de la réponse correcte invalide.' });
            return;
        }
        let propositions = [];
        if (mode === 'carré') {
            propositions = shuffle(allAnswers);
        }
        else if (mode === 'duo') {
            if (incorrectAnswers.length < 1) {
                res.status(400).json({ message: "Pas assez de mauvaises réponses pour le mode duo." });
                return;
            }
            const randomIncorrectAnswer = shuffle(incorrectAnswers)[0];
            propositions = shuffle([correctAnswer, randomIncorrectAnswer]);
        }
        res.json(propositions);
    }
    catch (error) {
        next(error);
    }
};
exports.getQuestionPropositions = getQuestionPropositions;
// =================================================================
// Quizzes
// =================================================================
const createQuiz = async (req, res, next) => {
    const { title, theme, questions } = req.body;
    if (!req.currentUser) {
        res.status(401).json({ error: 'Utilisateur non authentifié.' });
        return;
    }
    if (!title || !theme || !questions || !Array.isArray(questions) || questions.length === 0) {
        res.status(400).json({ error: 'Les données du quiz sont incomplètes ou invalides.' });
        return;
    }
    try {
        const newQuiz = await prisma.$transaction(async (tx) => {
            const newTheme = await tx.theme.upsert({ where: { name: theme }, update: {}, create: { name: theme } });
            const createdQuestions = await Promise.all(questions.map((q) => tx.question.create({
                data: {
                    label: q.label,
                    answer1: q.answer1,
                    answer2: q.answer2,
                    answer3: q.answer3,
                    answer4: q.answer4,
                    correctAnswer: q.correctAnswer,
                    themeId: newTheme.id,
                    creatorId: req.currentUser.id,
                },
            })));
            const quiz = await tx.quiz.create({
                data: {
                    title,
                    themeId: newTheme.id,
                    creatorId: req.currentUser.id,
                    questions: { connect: createdQuestions.map((q) => ({ id: q.id })) },
                },
                include: { questions: true, theme: true },
            });
            return quiz;
        });
        res.status(201).json(newQuiz);
    }
    catch (error) {
        next(error);
    }
};
exports.createQuiz = createQuiz;
const getQuizzes = async (req, res, next) => {
    try {
        const quizzes = await prisma.quiz.findMany({
            where: { themeId: req.query.themeId ? Number(req.query.themeId) : undefined },
            include: { theme: true, creator: { select: { id: true, email: true } }, _count: { select: { questions: true } } },
        });
        res.json(quizzes);
    }
    catch (error) {
        next(error);
    }
};
exports.getQuizzes = getQuizzes;
const getCreatedQuizzes = async (req, res, next) => {
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
    }
    catch (error) {
        next(error);
    }
};
exports.getCreatedQuizzes = getCreatedQuizzes;
const getQuizById = async (req, res, next) => {
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
    }
    catch (error) {
        next(error);
    }
};
exports.getQuizById = getQuizById;
const updateQuiz = async (req, res, next) => {
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
                questions: questionIds ? { set: questionIds.map((id) => ({ id })) } : undefined,
            },
        });
        res.json(updatedQuiz);
    }
    catch (error) {
        next(error);
    }
};
exports.updateQuiz = updateQuiz;
const deleteQuiz = async (req, res, next) => {
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
    }
    catch (error) {
        next(error);
    }
};
exports.deleteQuiz = deleteQuiz;
// =================================================================
// Jeu & Scores
// =================================================================
const submitAnswer = async (req, res, next) => {
    if (!req.currentUser) {
        res.status(401).json({ error: 'Utilisateur non authentifié.' });
        return;
    }
    const { quizId, questionId, mode, answerId, answerText } = req.body;
    try {
        const question = await prisma.question.findUnique({ where: { id: questionId } });
        if (!question || typeof question.correctAnswer !== 'number') {
            res.status(404).json({ error: 'Question non trouvée ou mal configurée.' });
            return;
        }
        let isCorrect = false;
        let scoreToUpdate = 0;
        const correctAnswerText = question[`answer${question.correctAnswer}`];
        if (!correctAnswerText) {
            res.status(500).json({ error: 'Configuration de la réponse correcte invalide.' });
            return;
        }
        switch (mode) {
            case 'cash':
                if (answerText) {
                    const similarity = stringSimilarity.compareTwoStrings(answerText.toLowerCase(), correctAnswerText.toLowerCase());
                    isCorrect = similarity >= 0.9;
                    scoreToUpdate = isCorrect ? 5 : 0;
                }
                break;
            case 'carré':
                if (answerId) {
                    isCorrect = (answerId === question.correctAnswer);
                    scoreToUpdate = isCorrect ? 3 : 0;
                }
                break;
            case 'duo':
                if (answerId) {
                    isCorrect = (answerId === question.correctAnswer);
                    scoreToUpdate = isCorrect ? 1 : 0;
                }
                break;
            default:
                res.status(400).json({ error: 'Mode de réponse non valide.' });
                return;
        }
        if (scoreToUpdate > 0) {
            await prisma.score.upsert({
                where: { userQuiz: { userId: req.currentUser.id, quizId: Number(quizId) } },
                update: { score: { increment: scoreToUpdate } },
                create: { score: scoreToUpdate, userId: req.currentUser.id, quizId: Number(quizId) },
            });
        }
        res.status(200).json({
            isCorrect,
            correctAnswer: correctAnswerText,
            score: scoreToUpdate
        });
    }
    catch (error) {
        next(error);
    }
};
exports.submitAnswer = submitAnswer;
// =================================================================
// Hall of Fame
// =================================================================
const getGlobalHallOfFame = async (_req, res, next) => {
    try {
        // Get top 10 users based on summed score
        const topUsersByTotalScore = await prisma.score.groupBy({
            by: ['userId'],
            _sum: { score: true },
            orderBy: { _sum: { score: 'desc' } },
            take: 10,
        });
        const topUserIds = topUsersByTotalScore.map(u => u.userId);
        // Fetch all scores for these top users, including quiz and user details
        const scoresForTopUsers = await prisma.score.findMany({
            where: { userId: { in: topUserIds } },
            include: {
                user: { select: { id: true, email: true } },
                quiz: { select: { id: true, title: true } },
            },
            orderBy: { score: 'desc' }
        });
        // Group the scores by user to create the final structure, maintaining the original order
        const hallOfFameData = topUserIds.map(userId => {
            const userScores = scoresForTopUsers.filter(score => score.userId === userId);
            if (userScores.length === 0)
                return null;
            return {
                userId: userId,
                email: userScores[0].user.email,
                scores: userScores.map(s => ({
                    quizId: s.quizId,
                    quizTitle: s.quiz.title,
                    score: s.score,
                }))
            };
        }).filter(item => item !== null);
        res.json(hallOfFameData);
    }
    catch (error) {
        next(error);
    }
};
exports.getGlobalHallOfFame = getGlobalHallOfFame;
const getQuizHallOfFame = async (req, res, next) => {
    try {
        const topScores = await prisma.score.findMany({
            where: { quizId: Number(req.params.id) },
            orderBy: { score: 'desc' },
            take: 10,
            include: { user: { select: { id: true, email: true } } },
        });
        res.json(topScores);
    }
    catch (error) {
        next(error);
    }
};
exports.getQuizHallOfFame = getQuizHallOfFame;
