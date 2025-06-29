"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const quizController_1 = require("../controllers/quizController");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Routes pour les Thèmes
router.get('/themes', quizController_1.getThemes);
router.post('/themes', auth_middleware_1.authenticate, quizController_1.createTheme);
router.put('/themes/:id', auth_middleware_1.authenticate, quizController_1.updateTheme);
router.delete('/themes/:id', auth_middleware_1.authenticate, quizController_1.deleteTheme);
// Routes pour les Questions
router.get('/questions', quizController_1.getQuestionsByTheme);
router.get('/questions/created', auth_middleware_1.authenticate, quizController_1.getCreatedQuestions);
router.post('/questions', auth_middleware_1.authenticate, quizController_1.createQuestion);
router.put('/questions/:id', auth_middleware_1.authenticate, quizController_1.updateQuestion);
router.delete('/questions/:id', auth_middleware_1.authenticate, quizController_1.deleteQuestion);
// Route pour récupérer les propositions d'une question (ex: pour le mode 'duo')
router.get('/questions/:id/propositions', auth_middleware_1.authenticate, quizController_1.getQuestionPropositions);
// Routes pour les Quizzes
router.get('/', auth_middleware_1.authenticate, quizController_1.getQuizzes);
router.get('/created', auth_middleware_1.authenticate, quizController_1.getCreatedQuizzes);
router.get('/:id', auth_middleware_1.authenticate, quizController_1.getQuizById);
router.post('/', auth_middleware_1.authenticate, quizController_1.createQuiz);
router.put('/:id', auth_middleware_1.authenticate, quizController_1.updateQuiz);
router.delete('/:id', auth_middleware_1.authenticate, quizController_1.deleteQuiz);
// Route pour le jeu
router.post('/submit', auth_middleware_1.authenticate, quizController_1.submitAnswer);
// Routes pour le Hall of Fame
router.get('/hall-of-fame/global', quizController_1.getGlobalHallOfFame);
router.get('/hall-of-fame/:id', quizController_1.getQuizHallOfFame);
exports.default = router;
