const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Une erreur interne est survenue';

   if (err.name === 'CastError') {
    statusCode = 400;
    message = `Format d'identifiant invalide : ${err.value}`;
  }

   if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'champ';
    message = `Le champ '${field}' existe déjà avec cette valeur.`;
  }

   if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(val => val.message).join(', ');
  }

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
