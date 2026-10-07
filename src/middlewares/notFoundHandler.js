const AppError = require('../utils/AppError');

const notFoundHandler = (req, res, next) => {
  next(new AppError(`La route demandée '${req.originalUrl}' n'existe pas sur ce serveur.`, 404));
};

module.exports = notFoundHandler;
