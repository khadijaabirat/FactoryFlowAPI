const mongoose = require('mongoose');
const env = require('./env');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGO_URI);
    console.log(`[Database] Connecté à MongoDB avec succès : ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[Database] Erreur de connexion MongoDB : ${error.message}`);
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('[Database] Déconnecté de MongoDB');
  } catch (error) {
    console.error(`[Database] Erreur de déconnexion MongoDB : ${error.message}`);
  }
};

module.exports = {
  connectDB,
  disconnectDB
};
