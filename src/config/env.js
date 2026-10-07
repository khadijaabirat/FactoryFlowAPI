const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/factoryflow?replicaSet=rs0&directConnection=true',
  jwtSecret: process.env.JWT_SECRET || 'factoryflow_jwt_secret_dev_key_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h'
};
