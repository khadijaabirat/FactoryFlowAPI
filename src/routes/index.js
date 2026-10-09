const express = require('express');
const router = express.Router();
const instalationRoutes=require('./instalation.routes');

router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API FactoryFlow en direct'
  });
});

router.use('/installation',instalationRoutes);


module.exports = router;
