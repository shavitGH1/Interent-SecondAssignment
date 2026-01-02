const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { app } = require('./app');
const { connectDB } = require('./config/database');

const envDevPath = path.join(__dirname, '..', '.env.dev');
if (fs.existsSync(envDevPath)) {
  dotenv.config({ path: envDevPath });
} else {
  dotenv.config();
}

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`API listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
