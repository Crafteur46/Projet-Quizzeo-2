import { Router } from 'express';
import {
    createTheme, getThemes, updateTheme, deleteTheme,
    createQuestion, getQuestionsByTheme,
    createQuiz, getQuizzes, getCreatedQuizzes, getQuizById,
    submitAnswer,
    getQuestionPropositions,
    getQuizHallOfFame, getGlobalHallOfFame
} from '../controllers/quizController';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Routes pour les Thèmes
router.get('/themes', getThemes);
router.post('/themes', authenticate, createTheme);
router.put('/themes/:id', authenticate, updateTheme);
router.delete('/themes/:id', authenticate, deleteTheme);

// Routes pour les Questions
router.get('/questions', getQuestionsByTheme);
router.post('/questions', authenticate, createQuestion);

// Route pour récupérer les propositions d'une question (ex: pour le mode 'duo')
router.get('/questions/:id/propositions', authenticate, getQuestionPropositions);

// Routes pour les Quizzes
router.get('/', authenticate, getQuizzes);
router.get('/created', authenticate, getCreatedQuizzes);
router.get('/:id', authenticate, getQuizById);
router.post('/', authenticate, createQuiz);

// Route pour le jeu
router.post('/submit', authenticate, submitAnswer);

// Routes pour le Hall of Fame
router.get('/hall-of-fame/global', authenticate, getGlobalHallOfFame);
router.get('/hall-of-fame/:id', getQuizHallOfFame);

export default router;
