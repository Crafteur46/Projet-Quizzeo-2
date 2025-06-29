import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import authRoutes from './routes/auth.routes';
import quizRoutes from './routes/quizRoutes';

dotenv.config();

const app: Express = express();
const port = process.env.BACKEND_PORT || 3001;

app.use(cors());
app.use(express.json());



app.use('/api/auth', authRoutes);
app.use('/api/quizzes', quizRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Quizzeo API is running!');
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
