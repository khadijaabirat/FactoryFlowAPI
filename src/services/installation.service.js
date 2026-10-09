const UserRepository = require('../repositories/user.repository');
const bcrypt = require('bcryptjs');
const AppError = require('../utils/AppError');
class InstallationService{
    async BooleanInstalation() {
        const countAdmins = await UserRepository.countAdmins();
        return countAdmins > 0;
    }
    async getInstallationStatus() {
        return await this.BooleanInstalation();
    }
    async getInstalationStatut() {
        return await this.BooleanInstalation();
    }
    async instalationApplication(adminData){
        const isInstalled = await this.BooleanInstalation();
        if(isInstalled){
            throw new AppError("l application est déja instatleé",409);
            
        }else {
            if(!adminData.name || !adminData.email || !adminData.password){
                throw new AppError('le nom lemail est le password sont obligatoires',400);
            }
                const hpassword = await bcrypt.hash(adminData.password, 10);
                const Padmin = await UserRepository.create({
                    name: adminData.name,
                    email: adminData.email,
                    password: hpassword,
                    role: 'ADMIN'
                }); 
                return {
                    _id:Padmin._id,
                    name:Padmin.name,
                    email:Padmin.email,
                    role:Padmin.role
                };

        }
    }

}
module.exports= new InstallationService();