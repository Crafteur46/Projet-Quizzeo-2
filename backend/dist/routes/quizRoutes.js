"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const quizController_1 = require("../controllers/quizController");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Routes pour les Thèmes
router.get('/themes', (req, res, next) => {
    Promise.resolve((0, quizController_1.getThemes)(req, res)).catch(next);
});
router.post('/themes', auth_middleware_1.authenticate, (req, res, next) => {
    Promise.resolve((0, quizController_1.createTheme)(req, res)).catch(next);
});
router.put('/themes/:id', auth_middleware_1.authenticate, (req, res, next) => {
    Promise.resolve((0, quizController_1.updateTheme)(req, res)).catch(next);
});
router.delete('/themes/:id', auth_middleware_1.authenticate, (req, res, next) => {
    Promise.resolve((0, quizController_1.deleteTheme)(req, res)).catch(next);
});
// Routes pour les Questions
router.get('/questions', (req, res, next) => {
    Promise.resolve((0, quizController_1.getQuestionsByTheme)(req, res)).catch(next);
});
router.post('/questions', auth_middleware_1.authenticate, (req, res, next) => {
    Promise.resolve((0, quizController_1.createQuestion)(req, res)).catch(next);
});
// Routes pour les Quizzes
router.get('/', (req, res, next) => {
    Promise.resolve((0, quizController_1.getQuizzes)(req, res)).catch(next);
});
router.get('/:id', (req, res, next) => {
    Promise.resolve((0, quizController_1.getQuizById)(req, res)).catch(next);
});
router.post('/', auth_middleware_1.authenticate, (req, res, next) => {
    Promise.resolve((0, quizController_1.createQuiz)(req, res)).catch(next);
});
// Route pour le jeu
router.post('/submit', auth_middleware_1.authenticate, (req, res, next) => {
    Promise.resolve((0, quizController_1.submitAnswer)(req, res)).catch(next);
});
// Routes pour le Hall of Fame
router.get('/hall-of-fame/global', (req, res, next) => {
    Promise.resolve((0, quizController_1.getGlobalHallOfFame)(req, res)).catch(next);
});
router.get('/hall-of-fame/:id', (req, res, next) => {
    Promise.resolve((0, quizController_1.getQuizHallOfFame)(req, res)).catch(next);
});
exports.default = router;
