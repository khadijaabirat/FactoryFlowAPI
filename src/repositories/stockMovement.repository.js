const { default: mongoose } = require("mongoose");
const StockMovement = require("../models/StockMovement");

class StockMovementRepository{
    async create(movementData,session=null){
        if(session){
            const [movement]= await StockMovement.create([movementData],{session});
            return movement;
        }
        const movement =await StockMovement.create(movementData);
        return movement;
    }
    async findAll(){
        const StockMovements= await StockMovement.find()
        .populate('materialId','reference name unit')
        .populate('performedBy','name email role')
        .sort({createdAt:-1});
        return StockMovements;
    }
    async findByMaterialId(materialId){
        const StockMovements= await StockMovement.find({materialId})
        .populate('performedBy','name email role')
        .sort({createdAt:-1});
        return StockMovements;
    }
    async findByOrderId(orderId){
        const StockMovements=await StockMovement.find({orderId});
        return StockMovements;
    }

}
module.exports= new StockMovementRepository();