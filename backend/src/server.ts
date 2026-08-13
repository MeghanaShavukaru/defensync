import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import assetRoutes from './routes/assetRoutes';
import baseRoutes from './routes/baseRoutes';
import equipmentTypeRoutes from './routes/equipmentTypeRoutes';
import supplierRoutes from './routes/supplierRoutes';
import userRoutes from './routes/userRoutes';
import transactionRoutes from './routes/transactionRoutes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const configuredOrigins = [
  process.env.FRONTEND_URL,
  process.env.BACKEND_URL,
  'http://127.0.0.1:5174',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://localhost:5173',
  'http://127.0.0.1:4000',
  'http://localhost:4000',
].filter(Boolean) as string[];

// Accept configuration values with an accidental path (for example `/login`).
// The browser's Origin header always contains only scheme, host, and port.
const allowedOrigins = configuredOrigins.map((value) => {
  try {
    return new URL(value).origin;
  } catch {
    return value.replace(/\/$/, '');
  }
});

app.use(cors({ origin: allowedOrigins, credentials: true }));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
}));

app.use('/api/auth', authRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/bases', baseRoutes);
app.use('/api/equipment-types', equipmentTypeRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/admin/users', userRoutes);
app.use('/api', transactionRoutes);

const publicPath = process.env.FRONTEND_DIST_PATH ?? path.resolve(__dirname, '../../frontend/dist');
app.use(express.static(publicPath));

app.get('/health', (req, res) => {
  res.json({ success: true, data: { status: 'OK' }, message: 'Health check passed' });
});

app.get('*', (req, res) => {
  res.sendFile('index.html', { root: publicPath });
});

app.use(errorHandler);

const port = Number(process.env.PORT || 4000);
const host = process.env.HOST || '0.0.0.0';

app.listen(port, host, () => {
  console.log(`Backend running on http://${host}:${port}`);
});
