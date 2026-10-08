const AppError = require('../utils/AppError');

const notFoundHandler = (req, res, next) => {
  next(new AppError(`Route introuvable : ${req.originalUrl}`, 404));
};

module.exports = notFoundHandler;
