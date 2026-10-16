const stockMovementService = require("../services/stockMovement.service");
const asyncHandler = require("../utils/asyncHandler");

const createMovement =  asyncHandler(async(req,res,next)=>{
const data= req.body;
const id= req.user.id;
const movement= await stockMovementService.createMovement(data,id);
return res.status(201).json({
    success:true,
    message:'mouvement de stock enregistré avec succeés',
    movement
});
});



const getAllMouvements=asyncHandler(async(req,res,next)=>{
const mouvements= await stockMovementService.getAllMouvements();
return res.status(200).json({
    success:true,
    count:mouvements.length,
    mouvements
});
});


module.exports={
    createMovement,
    getAllMouvements
}