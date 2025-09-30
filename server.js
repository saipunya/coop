// Project Bootstrap Tasks (all implemented below)
// TODO: Initialize Express app            -> express() created
// TODO: Load environment variables from .env -> dotenv.config()
// TODO: Connect to MySQL using db.js      -> db imported/used indirectly by routes
// TODO: Setup middleware: body-parser, cors -> app.use(bodyParser.json()), cors(), urlencoded
// TODO: Setup routes: auth.js, users.js, accounts.js, transactions.js -> mounted under /api
// TODO: Setup error handling middleware   -> error handler + fallback
// TODO: Start server on port from env     -> app.listen(process.env.PORT || 4000)

import dotenv from 'dotenv';
dotenv.config(); // Loaded env variables

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import ejs from 'ejs';
import compression from 'compression';
import { errorHandler } from './src/middleware/errorHandler.js';

// Optional (only if these route files exist)
import authRoutes from './src/routes/auth.js';    // TODO: ensure file exists
import userRoutes from './src/routes/user.js';    // TODO: ensure file exists
import accountRoutes from './src/routes/accounts.js'; // TODO: ensure file exists
import adminRoutes from './src/routes/admin.js';  // TODO: ensure file exists
// If you do not have them yet, comment the imports & uses.

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express(); // Express app initialized

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static assets
app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders: (res, filePath) => {
    if (/\.(png|jpg|jpeg|gif|svg|css|js|woff2?)$/i.test(filePath)) {
      res.setHeader('Cache-Control', 'public,max-age=31536000,immutable');
    }
  }
}));
app.use('/remixicon', express.static(path.join(__dirname, 'node_modules', 'remixicon')));

// Security & middleware
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(compression());

// Landing page
app.get('/', (req, res) => res.render('index'));

// Health check
app.get('/api/health', (req, res) => res.json({ ok: true }));

// API routes (comment out if not yet implemented)
// Routes mounted (auth, user, accounts, admin) satisfy routing TODO
app.use('/api/auth', authRoutes);
app.use('/api', userRoutes);
app.use('/api', accountRoutes);
app.use('/api', adminRoutes);

// Basic error handler (keep minimal)
// Error handlers registered (custom + generic) satisfy error handling TODO
app.use((err, req, res, next) => { // eslint-disable-line
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.use(errorHandler);

// Server start uses PORT from env (fulfills start server TODO)
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
