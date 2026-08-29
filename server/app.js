// server/app.js
// Entry point — IISNode will point directly at this file in production
// (see FARAS_IIS_Deployment_Guide.md). Do not rename or move it.

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const env = require('./config/env');
const authRoutes = require('./routes/authRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const surveyRoutes = require('./routes/surveyRoutes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

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

// Health check — confirms the process is up behind IIS/IISNode.
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/scheduling', scheduleRoutes);
app.use('/api/survey', surveyRoutes);

// Feature routers are mounted here by later tasks (ai-reports, approval, etc.).

app.use(notFound);
app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`[FARAS] server listening on port ${env.port} (${env.nodeEnv})`);
});

module.exports = app;