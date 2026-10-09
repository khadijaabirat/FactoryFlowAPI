const express=require('express');
const router=express.Router();
const installationController= require('../controllers/installation.controller');


router.get('/status',installationController.getStatus);
router.post('/',installationController.installApplication);


module.exports=router;