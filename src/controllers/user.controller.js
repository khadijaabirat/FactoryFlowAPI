const userRepository = require("../repositories/user.repository");
const userService = require("../services/user.service");
const asyncHandler = require("../utils/asyncHandler");

const createUser=asyncHandler(async(req,res,next)=>{
const newUser = await userService.createUser(req.body);
return res.status(201).json({
    success:true,
    message:'lutilisateur est creé avec succeés',
    data:newUser
})
});

const getAllUsers= asyncHandler(async(req,res,next)=>{
const users= await userService.getAllUsers();
return res.status(200).json({
success:true,
data:users
});
});
module.exports={createUser,getAllUsers}