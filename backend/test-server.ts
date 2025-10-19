console.log('🔍 Test server starting...');

try {
  console.log('1️⃣ Loading dotenv...');
  import('dotenv').then(dotenv => {
    dotenv.config();
    console.log('✅ dotenv loaded');
    console.log('2️⃣ Checking environment variables...');
    console.log('   NODE_ENV:', process.env.NODE_ENV);
    console.log('   PORT:', process.env.PORT);
    console.log('   MONGO_URI exists:', !!process.env.MONGO_URI);
    console.log('   REDIS_URL:', process.env.REDIS_URL);

    console.log('3️⃣ Loading express...');
    const express = require('express');
    console.log('✅ express loaded');

    console.log('4️⃣ Creating app...');
    const app = express();
    console.log('✅ app created');

    console.log('5️⃣ Starting listen...');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`✅ Simple server running on port ${PORT}`);
      console.log('If you see this, the issue is NOT with basic setup');
      process.exit(0);
    });
  });
} catch (error: any) {
  console.error('❌ Error:', error.message);
  console.error(error);
  process.exit(1);
  const Joi = require('joi');
console.log('Joi loaded:', typeof Joi);
console.log('Joi.object:', typeof Joi.object);
}

