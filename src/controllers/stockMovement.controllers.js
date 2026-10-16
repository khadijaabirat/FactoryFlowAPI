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

module.exports={
    createMovement
}