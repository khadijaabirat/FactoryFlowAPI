const mongoose = require('mongoose');
const env = require('./env');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.mongoUri);
    console.log(`[MongoDB] Connecté avec succès : ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB] Erreur de connexion : ${error.message}`);
    if (env.nodeEnv !== 'test') {
      process.exit(1);
    }
    throw error;
  }
};

module.exports = connectDB;
