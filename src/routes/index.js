const express = require('express');
const router = express.Router();
const instalationRoutes=require('./instalation.routes');
const authRoutes= require('../routes/auth.routes');
const usersRoutes= require('../routes/user.routes');
const materialRoutes= require('../routes/material.routes');
const stockMovementRoutes= require('./stockMovement');
const productRoutes= require('../routes/product.routes');
const orderRoutes= require('./order.routes');

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
router.use('/stock-movements',stockMovementRoutes);
router.use('/products',productRoutes);
router.use('/orders',orderRoutes);
router.use('/manufacturing-orders',orderRoutes);
module.exports = router;

