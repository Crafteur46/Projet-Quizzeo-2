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
exports.getGlobalHallOfFame = exports.getQuizHallOfFame = exports.submitAnswer = exports.getQuizById = exports.getQuizzes = exports.createQuiz = exports.getQuestionsByTheme = exports.createQuestion = exports.deleteTheme = exports.updateTheme = exports.getThemes = exports.createTheme = void 0;
const client_1 = require("@prisma/client");
const stringSimilarity = __importStar(require("string-similarity"));
const prisma = new client_1.PrismaClient();
// Thèmes
const createTheme = async (req, res) => {
    const { name } = req.body;
    try {
        const theme = await prisma.theme.create({ data: { name } });
        res.status(201).json(theme);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create theme' });
    }
};
exports.createTheme = createTheme;
const getThemes = async (_req, res) => {
    try {
        const themes = await prisma.theme.findMany();
        res.json(themes);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch themes' });
    }
};
exports.getThemes = getThemes;
const updateTheme = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    try {
        const theme = await prisma.theme.update({
            where: { id: Number(id) },
            data: { name },
        });
        res.json(theme);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update theme' });
    }
};
exports.updateTheme = updateTheme;
const deleteTheme = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.theme.delete({ where: { id: Number(id) } });
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete theme' });
    }
};
exports.deleteTheme = deleteTheme;
// Questions
const createQuestion = async (req, res) => {
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
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create question' });
    }
};
exports.createQuestion = createQuestion;
const getQuestionsByTheme = async (req, res) => {
    const { themeId } = req.query;
    if (!themeId) {
        return res.status(400).json({ error: 'Theme ID is required' });
    }
    try {
        const questions = await prisma.question.findMany({ where: { themeId: Number(themeId) } });
        res.json(questions);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch questions' });
    }
};
exports.getQuestionsByTheme = getQuestionsByTheme;
// Quizzes
const createQuiz = async (req, res) => {
    const { title, themeId, questionIds } = req.body; // Attendre un titre et un tableau d'IDs de questions
    const creatorId = req.currentUser?.id;
    if (!title || !themeId || !questionIds || !Array.isArray(questionIds) || questionIds.length !== 10) {
        res.status(400).json({ error: 'A quiz must have a title, a theme, and 10 questions.' });
        return;
    }
    if (!creatorId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
    }
    try {
        const quiz = await prisma.quiz.create({
            data: {
                title,
                themeId,
                creatorId,
                questions: { connect: questionIds.map((id) => ({ id })) },
            },
            include: { questions: true }, // Inclure les questions dans la réponse
        });
        res.status(201).json(quiz);
    }
    catch (error) {
        console.error('Error creating quiz:', error);
        res.status(500).json({ error: 'Failed to create quiz' });
    }
};
exports.createQuiz = createQuiz;
const getQuizzes = async (req, res) => {
    try {
        const quizzes = await prisma.quiz.findMany({
            include: { theme: true, creator: true },
        });
        res.json(quizzes);
    }
    catch (error) {
        console.error('Failed to fetch quizzes:', error); // Keep enhanced logging
        res.status(500).json({ error: 'Failed to fetch quizzes' });
    }
};
exports.getQuizzes = getQuizzes;
const getQuizById = async (req, res) => {
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
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch quiz' });
    }
};
exports.getQuizById = getQuizById;
// Game Logic
const submitAnswer = async (req, res) => {
    const { quizId, questionId, answer, mode } = req.body;
    if (!req.currentUser) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    const userId = req.currentUser.id;
    try {
        const question = await prisma.question.findUnique({ where: { id: questionId } });
        if (!question)
            return res.status(404).json({ error: 'Question not found' });
        let score = 0;
        let isCorrect = false;
        // Type-safe way to access the correct answer
        const answerKey = `answer${question.correctAnswer}`;
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
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to submit answer' });
    }
};
exports.submitAnswer = submitAnswer;
// Hall of Fame
const getQuizHallOfFame = async (req, res) => {
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
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to get hall of fame' });
    }
};
exports.getQuizHallOfFame = getQuizHallOfFame;
const getGlobalHallOfFame = async (req, res) => {
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
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to get global hall of fame' });
    }
};
exports.getGlobalHallOfFame = getGlobalHallOfFame;
