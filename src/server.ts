import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { app } from './app';
import { connectDB } from './config/database';

const envDevPath = path.join(__dirname, '..', '.env.dev');
if (fs.existsSync(envDevPath)) {
  dotenv.config({ path: envDevPath });
} else {
  dotenv.config();
}

const PORT = process.env.PORT || 3000;

const startServer = async (): Promise<void> => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`API listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', (error as Error).message);
    process.exit(1);
  }
};

startServer();
