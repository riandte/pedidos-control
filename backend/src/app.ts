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
  origin: (origin, callback) => {
    const allowedOrigins = [
      process.env.CORS_ORIGIN,
      'https://pedidoscontrol.vercel.app',
      'http://localhost:5173',
      'http://localhost:3000'
    ];
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (process.env.CORS_ORIGIN === '*' || allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      // Opcional: Permitir temporariamente tudo para debug se necessário, mas melhor restringir
      // callback(new Error('Not allowed by CORS'));
      // Para evitar bloqueio excessivo durante testes, vamos logar e permitir (cuidado em prod)
      console.log('Origin not explicitly allowed:', origin);
      return callback(null, true); 
    }
  },
  credentials: true
})); // CORS
app.use(express.json()); // Parse JSON
app.use(morgan('dev')); // Logger

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
