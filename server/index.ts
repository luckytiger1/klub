import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { checkSupabaseConnection } from './utils/supabase';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', async (req: Request, res: Response) => {
  try {
    const dbStatus = await checkSupabaseConnection();
    
    return res.status(dbStatus.success ? 200 : 500).json({
      status: 'ok',
      timestamp: new Date(),
      database: dbStatus
    });
  } catch (error) {
    console.error('Health check error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Server health check failed',
      error
    });
  }
});

// Import route files
import restaurantRoutes from './routes/restaurant';
import userRoutes from './routes/user';

// Register routes
app.use('/api/restaurant', restaurantRoutes);
app.use('/api/user', userRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/api/health`);
}); 