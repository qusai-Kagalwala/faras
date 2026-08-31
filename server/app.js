// server/app.js
// Entry point — IISNode points directly at this file in production
// (see FARAS_IIS_Deployment_Guide.md web.config: path="server/app.js").
// Do not rename or move it, and do not split this into a separate
// server.js/app.js pair — the deployment guide's IISNode handler is
// hardcoded to this exact path.

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const env = require('./config/env');
const authRoutes = require('./modules/auth/auth.routes');
const schedulingRoutes = require('./modules/scheduling/scheduling.routes');
const surveyRoutes = require('./modules/survey/survey.routes');
const mappingRoutes = require('./modules/mapping/mapping.routes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const approvalRoutes = require('./modules/approval/approval.routes');
const analyticsRoutes = require('./modules/analytics/analytics.routes');
const usersRoutes = require('./modules/users/users.routes');

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.allowedOrigin,
    credentials: true,
  })
);
app.use(express.json());

if (env.nodeEnv !== 'production') {
  app.use(morgan('dev'));
}

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/scheduling', schedulingRoutes);
app.use('/api/survey', surveyRoutes);
app.use('/api/mapping', mappingRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', usersRoutes);

app.use(notFoundHandler);
app.use(errorHandler); // must be last

const server = app.listen(env.port, () => {
  console.log(`[FARAS] server listening on port ${env.port} (${env.nodeEnv})`);
});

function shutdown(signal) {
  console.log(`[FARAS] ${signal} received. Shutting down gracefully...`);
  server.close(() => {
    console.log('[FARAS] HTTP server closed.');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('[FARAS] Forced shutdown after timeout.');
    process.exit(1);
  }, 10_000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  console.error('[FARAS] Unhandled promise rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('[FARAS] Uncaught exception:', err.message);
});

module.exports = app;