import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import session from 'express-session';
import authRoutes from './routes/auth.routes';
import quizRoutes from './routes/quizRoutes';

dotenv.config();

const app: Express = express();
const port = process.env.BACKEND_PORT || 3001;

app.use(cors());
app.use(express.json());

// Configuration de la session
app.use(session({
  secret: process.env.SESSION_SECRET || 'quizzeo-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 // 24 heures
  }
}));

app.use('/api/auth', authRoutes);
app.use('/api/quizzes', quizRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Quizzeo API is running!');
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
