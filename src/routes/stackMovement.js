const  {authenticate}  = require("../middlewares/auth.middleware");
const stockMovement= require("../controllers/stockMovement.controllers");
const express= require('express');
const router=express.Router();
router.post('/',authenticate,stockMovement.createMovement);
module.exports=router;