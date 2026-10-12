 const UserRepository= require('../repositories/user.repository');
 const AppError = require('../utils/AppError');
 const jwt= require('jsonwebtoken');
 const env=require('../config/env');
 const bcrypt= require('bcryptjs');

 class AuthService{
async login (userData){
if(!userData.email || !userData.password){
 throw new AppError('email et password sont obligatoire',400);
 
}
const user = await UserRepository.findByEmail(userData.email);
if(!user){
    throw new AppError('aucun user avec ce email',401);
}
const CompareP=await bcrypt.compare(userData.password,user.password);
if(!CompareP){
    throw new AppError('password invalide',401);
}
const token = jwt.sign(
    {
    id:user._id,
    role:user.role,
    email:user.email,
    name:user.name
},
env.JWT_SECRET,
{
    expiresIn:env.JWT_EXPIRES_IN
}
);
return {
    token,
    user:{
    _id:user._id,
    role:user.role,
    email:user.email,
    name:user.name
    }
};

}
 async getProfile(userId){
    const user = await UserRepository.findById(userId);
    if(!user){
        throw new AppError('Utilisateur introuvable',404);
    }
    return {
        _id:user._id,
        name:user.name,
        email:user.email,
        role:user.role
    }
 }
}
module.exports=new  AuthService();