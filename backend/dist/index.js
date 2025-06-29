"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const express_session_1 = __importDefault(require("express-session"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const quizRoutes_1 = __importDefault(require("./routes/quizRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.BACKEND_PORT || 3001;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Configuration de la session
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET || 'quizzeo-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 // 24 heures
    }
}));
app.use('/api/auth', auth_routes_1.default);
app.use('/api/quizzes', quizRoutes_1.default);
app.get('/', (req, res) => {
    res.send('Quizzeo API is running!');
});
app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
