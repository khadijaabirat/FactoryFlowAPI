const InstallationService = require('../services/installation.service');
const asyncHandler= require('../utils/asyncHandler');

const getStatus= asyncHandler(async (req, res) => {
const BooleanInstalation = await InstallationService.BooleanInstalation();

    return res.status(200).json({
        success:true,
        installed:BooleanInstalation
    });

}


);
const instalationApp = asyncHandler(async (req,res)=>{

    const admin = await InstallationService.instalationApplication(req.body);
    if(admin){
        return res.status(200).json({
            success:true,
            message:'lapplication est instaleé avec succeé',
            data:admin
        });
    }
});

 module.exports={
    getStatus,instalationApp
 }