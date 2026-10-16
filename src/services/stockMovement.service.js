const materialRepository = require("../repositories/material.repository");
const stockMovementRepository = require("../repositories/stockMovement.repository");
const AppError = require("../utils/AppError");

class StockMovementService {
    async createMovement(movementData,userId){
        if(!movementData.materialId || !movementData.type || !movementData.quantity || !movementData.reason){
             throw new AppError('tous les champs sont obligatoires',400);
        }
if(!['IN','OUT'].includes(movementData.type)){
    throw new  AppError('type doit etre out ro in',400);
}
if(movementData.quantity<=0){
     throw new AppError('la quantité doit etre supérieure a 0',400);
}
const matiére= await materialRepository.findById(movementData.materialId);
if(!matiére){
     throw new AppError('matiére introuvable',404);
}
if(movementData.type=='IN'){
    const newstock=matiére.availableQuantity+Number(movementData.quantity);
   await materialRepository.update(matiére._id,{availableQuantity:newstock});
}
if(movementData.type =='OUT'){
    if(matiére.availableQuantity<Number(movementData.quantity)){
        throw new AppError('le stock insuffisant pour cette sortie',400);
    }
        const newstock=matiére.availableQuantity-Number(movementData.quantity);
  await materialRepository.update(matiére._id,{availableQuantity:newstock});
} 

movementData.performedBy=userId;
const mouvement= await stockMovementRepository.create(movementData);
return mouvement;
}

async getAllMouvements(){
    const mouvements= await stockMovementRepository.findAll();
    return mouvements;
}


}
module.exports= new StockMovementService();