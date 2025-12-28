import express, { Request, Response, NextFunction } from 'express';
import 'express-async-errors';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import router from './routes';

// Carrega variáveis de ambiente
dotenv.config();

const app = express();

// Middlewares Globais
app.use(helmet()); // Segurança
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
})); // CORS
app.use(express.json()); // Parse JSON
app.use(morgan('dev')); // Logger

// Debug Logger Middleware
app.use((req, res, next) => {
  console.log(`[DEBUG] ${req.method} ${req.url}`);
  next();
});

// Rotas
app.use('/api', router);

// Health Check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Middleware de Erro Global
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).json({
    status: 'error',
    message: 'Internal Server Error',
  });
});

export { app };
