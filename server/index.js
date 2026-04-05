import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './db/connection.js';
import coursesRouter from './routes/courses.js';
import nodesRouter from './routes/nodes.js';
import uploadRouter from './routes/upload.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/courses', coursesRouter);
app.use('/api/nodes', nodesRouter);
app.use('/api/upload', uploadRouter);

// Health check
app.get('/api/health', (req, res) => {
  const bucket = process.env.S3_BUCKET_NAME;
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    storage: 'mysql',
    s3: {
      enabled: Boolean(bucket && bucket !== 'your_bucket_name'),
      bucket: bucket || '',
    },
  });
});

// Start server
async function start() {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`🚀 LearnLog server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
