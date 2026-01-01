const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

// Route files
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const aiRoutes = require('./routes/aiRoutes');

dotenv.config();

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: [
    process.env.CLIENT_URL,
    'http://localhost:5173',
    'https://nexjobpro.vercel.app', // Adding likely Vercel URL
    /\.vercel\.app$/ // Allow any Vercel preview deployment
  ].filter(Boolean),
  credentials: true
}));
app.use(helmet());
app.use(morgan('dev'));

// Mount routers
const apiRouter = express.Router();
app.use('/api', apiRouter);

apiRouter.use('/auth', authRoutes);
apiRouter.use('/jobs', jobRoutes);
apiRouter.use('/applications', applicationRoutes);
apiRouter.use('/ai', aiRoutes);

// Fallback for /api routes to handle potential routing issues
app.use('/api/jobs', jobRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/ai', aiRoutes);

app.get('/', (req, res) => {
  res.send('Job Board API is running...');
});

// Add a health check route at the root for Vercel
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is healthy' });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || err.status || (res.statusCode === 200 ? 500 : res.statusCode);
  console.error(`Error [${statusCode}]: ${err.message}`);
  if (err.stack) console.error(err.stack);
  
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// Start server
const PORT = process.env.PORT || 5000;
// Note: Vercel handles the app export, but Render/Heroku need app.listen
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
