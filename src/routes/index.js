const express = require('express');
const router = express.Router();
const instalationRoutes=require('./instalation.routes');
const authRoutes= require('../routes/auth.routes');
const usersRoutes= require('../routes/user.routes');
const materialRoutes= require('../routes/material.routes');
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API FactoryFlow en direct'
  });
});

router.use('/installation',instalationRoutes);
router.use('/auth',authRoutes);
router.use('/users',usersRoutes);
router.use('/materials',materialRoutes);
module.exports = router;
