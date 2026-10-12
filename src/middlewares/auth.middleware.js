const env = require("../config/env");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const jwt=require('jsonwebtoken');


const authenticate = asyncHandler(async(req,res,next)=>{
const authHeader=req.headers.authorization;
if(!authHeader || !authHeader.startsWith('Bearer')){
    throw new AppError('acceé non autorié : token manquant oui invalide',401);
}
const token = authHeader.split(' ')[1];
const decoded = jwt.verify(token,env.JWT_SECRET);
req.user= decoded;
next();

});



const authorise=(...roles)=>{
return (req,res,next)=>{
if(!req.user || !roles.includes(req.user.role)){
    throw new AppError('acceé refusé : permissions insuffisantes',403);
}
next();
};
};


module.exports= {
    authenticate,authorise
};