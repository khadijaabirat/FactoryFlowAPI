const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Endpoint de santé / vérification du serveur
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'FactoryFlow API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[FactoryFlow API] Serveur démarré sur le port ${PORT}`);
  });
}

module.exports = app;
