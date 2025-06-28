import { Router, Request, Response, NextFunction } from 'express';
import {
    createTheme, getThemes, updateTheme, deleteTheme,
    createQuestion, getQuestionsByTheme,
    createQuiz, getQuizzes, getQuizById,
    submitAnswer,
    getQuizHallOfFame, getGlobalHallOfFame
} from '../controllers/quizController';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Routes pour les Thèmes
router.get('/themes', (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(getThemes(req, res)).catch(next);
});
router.post('/themes', authenticate, (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(createTheme(req, res)).catch(next);
});
router.put('/themes/:id', authenticate, (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(updateTheme(req, res)).catch(next);
});
router.delete('/themes/:id', authenticate, (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(deleteTheme(req, res)).catch(next);
});

// Routes pour les Questions
router.get('/questions', (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(getQuestionsByTheme(req, res)).catch(next);
});
router.post('/questions', authenticate, (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(createQuestion(req, res)).catch(next);
});

// Routes pour les Quizzes
router.get('/', (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(getQuizzes(req, res)).catch(next);
});
router.get('/:id', (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(getQuizById(req, res)).catch(next);
});
router.post('/', authenticate, (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(createQuiz(req, res)).catch(next);
});

// Route pour le jeu
router.post('/submit', authenticate, (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(submitAnswer(req, res)).catch(next);
});

// Routes pour le Hall of Fame
router.get('/hall-of-fame/global', (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(getGlobalHallOfFame(req, res)).catch(next);
});
router.get('/hall-of-fame/:id', (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(getQuizHallOfFame(req, res)).catch(next);
});

export default router;
