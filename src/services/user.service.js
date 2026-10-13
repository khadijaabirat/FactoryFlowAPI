const bcrypt = require("bcryptjs");
const userRepository = require("../repositories/user.repository");
const AppError = require("../utils/AppError");

class UserService{
    async createUser(userData){

        if(!userData.name || !userData.email || !userData.password){
            throw new AppError('le nom et email et mot de passe sont obligatoires ',400);
        }
        const role = userData.role || 'OPERATOR';
        if(!["ADMIN","OPERATOR"].includes(role))
        {
            throw new AppError('Role invalide',400);
        }
        const findemail = await userRepository.findByEmail(userData.email);
        if(findemail)
        {
            throw new AppError('ce email est déja utilisé',409);
        }
        const passwordhashed= await bcrypt.hash(userData.password,10);
       const  user = await userRepository.create({
       name:userData.name,
       email:userData.email,
       password:passwordhashed,
       role:role});
       return {
        _id:user._id,
       name:user.name,
       email:user.email,
       role:user.role};

    }
    async getAllUsers(){
        const users =await userRepository.findAll();
        return users;

    }
}
module.exports= new UserService();