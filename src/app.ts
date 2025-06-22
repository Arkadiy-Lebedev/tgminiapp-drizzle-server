import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { db } from './db/connection';
import userRouter from './routes/users.routes';
import authRouter from './routes/auth.routes';
import gameRouter from './routes/game.routes';
import lidersRouter from './routes/liders.routes';
import { createBot } from './bot/bot';
// import postRouter from '@routes/posts.routes';
// import errorHandler from '@middlewares/error.middleware';
// import { logger } from '@utils/logger';

console.log(db)
const app = express();
const PORT = process.env.SERVER_PORT || 3000;

// Middlewares
app.use(cors({
  origin: 'https://testingbuild.ru/',  // Замените на ваш домен
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/users', userRouter);
app.use('/api/game', gameRouter);
app.use('/api/auth', authRouter);
app.use('/api/liders', lidersRouter);
// app.use('/api/posts', postRouter);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Error handling
// app.use(errorHandler);
const bot = createBot();
// Start server
app.listen(PORT, () => {
    console.log(PORT)
//   logger.info(`Server is running on http://localhost:${PORT}`);
//   logger.info('Connected to MySQL database');
});