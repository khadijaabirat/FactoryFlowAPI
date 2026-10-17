 
const express=require('express');
const router=express.Router();
const productController= require('../controllers/product.controller');
const { authenticate, authorise } = require('../middlewares/auth.middleware');

router.post('/', authenticate, authorise('ADMIN'), productController.createProduct);
router.get('/', authenticate, productController.getAllProduct);
router.get('/:id', authenticate, productController.getProductById);
router.put('/:id', authenticate, authorise('ADMIN'), productController.updateProduct);
router.delete('/:id', authenticate, authorise('ADMIN'), productController.deleteProduct);
router.post('/:id/bom', authenticate, authorise('ADMIN'), productController.updateCompsitionProduct);
router.post('/:id/com', authenticate, authorise('ADMIN'), productController.updateCompsitionProduct);

module.exports= router;