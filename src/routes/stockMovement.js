const  {authenticate}  = require("../middlewares/auth.middleware");
const stockMovement= require("../controllers/stockMovement.controllers");
const express= require('express');
const router=express.Router();
router.post('/',authenticate,stockMovement.createMovement);
router.get('/',authenticate,stockMovement.getAllMouvements);
module.exports=router;