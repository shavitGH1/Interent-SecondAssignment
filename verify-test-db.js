// Simple script to verify test environment
require('dotenv').config({ path: '.env.test' });

console.log('='.repeat(50));
console.log('Test Environment Verification');
console.log('='.repeat(50));
console.log('MONGO_URI:', process.env.MONGO_URI || 'NOT SET');
console.log('PORT:', process.env.PORT || 'NOT SET');
console.log('='.repeat(50));

const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/second_assignment_test';
const dbName = uri.split('/').pop().split('?')[0];
console.log('Database name being used:', dbName);
console.log('='.repeat(50));
