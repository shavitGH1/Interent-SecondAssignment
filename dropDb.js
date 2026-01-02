const mongoose = require('mongoose');

async function dropDatabase() {
  try {
    const mongoUri = 'mongodb://127.0.0.1:27017/second_assignment';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
    
    await mongoose.connection.dropDatabase();
    console.log('Database dropped successfully');
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

dropDatabase();
