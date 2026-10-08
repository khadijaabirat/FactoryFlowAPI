require('dotenv').config();

const env = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/factoryflow',
  JWT_SECRET: process.env.JWT_SECRET || 'defaultsecretkey',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h'
};

module.exports = env;
