const express = require('express');
const router =express.Router();
const { authenticate, authorise } = require("../middlewares/auth.middleware");
const userController=require('../controllers/user.controller');



router.post('/',authenticate,authorise('ADMIN'),userController.createUser);
router.get('/',authenticate,authorise('ADMIN'),userController.getAllUsers);

module.exports=router;