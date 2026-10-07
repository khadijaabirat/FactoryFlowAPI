const app = require('./app');
const connectDB = require('./config/database');
const env = require('./config/env');

const startServer = async () => {
  try {
    // Connexion à la base de données MongoDB
    await connectDB();

    // Démarrage du serveur Express
    const server = app.listen(env.port, () => {
      console.log(`[FactoryFlow API] Serveur opérationnel sur le port ${env.port} (${env.nodeEnv})`);
    });

    // Gestion propre des signaux d'arrêt
    process.on('SIGTERM', () => {
      console.log('[FactoryFlow API] Signal SIGTERM reçu. Arrêt gracieux...');
      server.close(() => process.exit(0));
    });

    process.on('SIGINT', () => {
      console.log('[FactoryFlow API] Signal SIGINT reçu. Arrêt gracieux...');
      server.close(() => process.exit(0));
    });
  } catch (error) {
    console.error(`[FactoryFlow API] Échec du démarrage du serveur : ${error.message}`);
    process.exit(1);
  }
};

startServer();
