const express = require('express');
const router = express.Router();
const instalationRoutes=require('./instalation.routes');
const authRoutes= require('../routes/auth.routes');

router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API FactoryFlow en direct'
  });
});

router.use('/installation',instalationRoutes);
router.use('/auth',authRoutes);

module.exports = router;
