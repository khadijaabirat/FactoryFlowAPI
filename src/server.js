const app = require('./app');
const env = require('./config/env');
const { connectDB } = require('./config/database');

const startServer = async () => {
  try {
     await connectDB();

     const server = app.listen(env.PORT, () => {
      console.log(`[Server] FactoryFlow API en écoute sur le port ${env.PORT} (mode: ${env.NODE_ENV})`);
    });

     process.on('unhandledRejection', (err) => {
      console.error(`[Server Error] Promesse non gérée : ${err.message}`);
      server.close(() => process.exit(1));
    });
  } catch (error) {
    console.error(`[Server Error] Impossible de démarrer le serveur : ${error.message}`);
    process.exit(1);
  }
};

startServer();
