const env = require('../config/env');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  // Gestion des IDs MongoDB invalides (CastError)
  if (err.name === 'CastError') {
    error.message = `Ressource introuvable avec l'identifiant : ${err.value}`;
    error.statusCode = 400;
  }

  // Gestion des clés dupliquées MongoDB (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'champ';
    const value = err.keyValue ? err.keyValue[field] : '';
    error.message = `La valeur '${value}' pour le champ '${field}' existe déjà. Ce champ doit être unique.`;
    error.statusCode = 409;
  }

  // Gestion des erreurs de validation Mongoose
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    error.message = messages.join('. ');
    error.statusCode = 400;
  }

  // Gestion des erreurs JWT
  if (err.name === 'JsonWebTokenError') {
    error.message = 'Jeton d\'authentification invalide.';
    error.statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    error.message = 'Jeton d\'authentification expiré.';
    error.statusCode = 401;
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message || 'Erreur interne du serveur.',
    ...(env.nodeEnv === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
