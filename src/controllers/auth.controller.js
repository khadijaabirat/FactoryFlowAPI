const AuthService= require('../services/auth.service');
const asyncHandler = require('../utils/asyncHandler');


const login = asyncHandler(async(req,res)=>{
const user= await AuthService.login(req.body);
return res.status(200).json({
success:true,
message:'connexion réussie',
data:user
});
});

const getProfile= asyncHandler(async(req,res)=>{
const user = await AuthService.getProfile(req.user.id);
 return res.status(200).json({
    success:true,
    data:user
 })
});
module.exports= {login,getProfile};

