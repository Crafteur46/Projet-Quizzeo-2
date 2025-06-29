"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const quizRoutes_1 = __importDefault(require("./routes/quizRoutes"));
// dotenv.config(); // Désactivé car les variables d'environnement sont fournies par Docker Compose
const app = (0, express_1.default)();
const port = process.env.BACKEND_PORT || 3001;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api/auth', auth_routes_1.default);
app.use('/api/quizzes', quizRoutes_1.default);
app.get('/', (req, res) => {
    res.send('Quizzeo API is running!');
});
app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
