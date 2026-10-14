const express= require('express');
const { authenticate, authorise } = require('../middlewares/auth.middleware');
const router= express.Router();
const materialController=require('../controllers/material.controller');

router.post('/',authenticate,authorise('ADMIN'),materialController.createMaterial);
router.get('/',authenticate,materialController.getAllMaterials);
router.get('/alerts/low-stock',authenticate,materialController.getLowStockMaterials);
router.get('/:id',authenticate,materialController.getMaterialById);
router.put('/:id',authenticate,authorise('ADMIN'),materialController.updateMaterial);
router.delete('/:id',authenticate,authorise('ADMIN'),materialController.deleteMaterial);


module.exports=router;