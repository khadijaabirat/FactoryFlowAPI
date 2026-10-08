const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Une erreur interne est survenue';

  // 1. Identifiant ObjectId Mongoose invalide
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Format d'identifiant invalide : ${err.value}`;
  }

  // 2. Doublon sur un champ unique (ex: référence ou email)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'champ';
    message = `Le champ '${field}' existe déjà avec cette valeur.`;
  }

  // 3. Erreur de validation Mongoose
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(val => val.message).join(', ');
  }

  // 4. Erreurs JWT
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Token d\'authentification invalide.';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token d\'authentification expiré.';
  }

  res.status(statusCode).json({
    success: false,
    message: message
  });
};

module.exports = errorHandler;
