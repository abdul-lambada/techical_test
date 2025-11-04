import express, { type Request, type Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import healthRouter from './routes/health.js';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.js';
import vehiclesRouter from './routes/vehicles.js';

dotenv.config();

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

const PORT = Number(process.env.PORT ?? 4000);

app.get('/', (_req: Request, res: Response) => {
  res.send('Vehicle Tracker API');
});

app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/vehicles', vehiclesRouter);

app.use((err: any, _req: any, res: any, _next: any) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
