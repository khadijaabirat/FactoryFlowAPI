const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');
const notFoundHandler = require('./middlewares/notFoundHandler');

const app = express();

// Middlewares de base
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Endpoint de santé du service
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'FactoryFlow API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Montage des routes sous /api
app.use('/api', apiRoutes);

// Gestion des routes non trouvées (404)
app.use(notFoundHandler);

// Middleware centralisé de gestion des erreurs
app.use(errorHandler);

module.exports = app;
