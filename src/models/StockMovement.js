const mongoose = require('mongoose');
const Material = require('./Material');
const StockMovementSchema= new mongoose.Schema({
materialId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Material',
    required:true
},
type:{
    type:String,
    enum:['IN','OUT'],
    required:true
},
quantity:{
    type:Number,
    required:true,
    min:0.01
},
reason:{
    type:String,
    required:true,
    trim:true
},
orderId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'ManufacturingOrder',
    default:null
},
performedBy:{
    type : mongoose.Schema.Types.ObjectId,
    ref:'User',
    required:true
}
},{
    timestamps:true
});
module.exports=mongoose.model('StockMovement',StockMovementSchema);