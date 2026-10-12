const express=require('express');
const router=express.Router();
const installationController= require('../controllers/instalation.conroller');


router.get('/status',installationController.getStatus);
router.post('/',installationController.instalationApp);


module.exports=router;