require('dotenv').config();
const express = require('express');
const helmet  = require('helmet');
const cors    = require('cors');
const morgan  = require('morgan');
const path    = require('path');
const logger  = require('./config/logger');
const { globalLimiter } = require('./middleware/rateLimiter.middleware');
const errorHandler      = require('./middleware/errorHandler.middleware');

const authRoutes          = require('./routes/auth.routes');
const usersRoutes         = require('./routes/users.routes');
const teachersRoutes      = require('./routes/teachers.routes');
const classesRoutes       = require('./routes/classes.routes');
const subjectsRoutes      = require('./routes/subjects.routes');
const gradesRoutes        = require('./routes/grades.routes');
const printRequestsRoutes = require('./routes/printRequests.routes');
const libraryRoutes       = require('./routes/library.routes');
const messagesRoutes      = require('./routes/messages.routes');
const notificationsRoutes = require('./routes/notifications.routes');
const quotesRoutes        = require('./routes/quotes.routes');
const analyticsRoutes     = require('./routes/analytics.routes');

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// HTTP request logging via morgan → winston
app.use(morgan('combined', {
  stream: { write: (msg) => logger.http(msg.trim()) },
}));

app.use(globalLimiter);
app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ extended: true, limit: '200mb' }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

app.use('/api/auth',           authRoutes);
app.use('/api/users',          usersRoutes);
app.use('/api/teachers',       teachersRoutes);
app.use('/api/classes',        classesRoutes);
app.use('/api/subjects',       subjectsRoutes);
app.use('/api/grades',         gradesRoutes);
app.use('/api/print-requests', printRequestsRoutes);
app.use('/api/library',        libraryRoutes);
app.use('/api/messages',       messagesRoutes);
app.use('/api/notifications',  notificationsRoutes);
app.use('/api/quotes',         quotesRoutes);
app.use('/api/admin/analytics', analyticsRoutes);

// Serve the built React client in production (single-service deployment).
// The client is built into client/dist and copied next to the server at
// deploy time (see Dockerfile). Any non-API route falls through to
// index.html so React Router can handle client-side routing.
const clientDistPath = path.join(__dirname, '../../client-dist');
const fs = require('fs');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get(/^(?!\/api|\/uploads|\/socket\.io).*/, (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found.` });
});

app.use(errorHandler);

module.exports = app;
