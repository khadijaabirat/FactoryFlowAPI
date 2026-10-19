 
const mongoose=require('mongoose');

const OrderSnapshotItemSchema= new mongoose.Schema({
materialId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Material',
    required:true
},
reference:{
    type:String,
    required:true
},
name:{
    type:String,
    required:true
},
unit:{
    type:String,
    required:true
},
quantityPerUnit:{
    type:Number,
    required:true,
    min:0.001
}},
{
    _id:false
}
);

const OrderItemSchema= new mongoose.Schema({
    productId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Product',
        required:true
    },
    quantity:{
        type:Number,
        required:true,
        min:1
    },
    snapshot:[OrderSnapshotItemSchema]
});

const OrderSchema= new mongoose.Schema({

    assignedTo:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    status:{
        type:String,
        enum: ['PLANIFIE', 'EN_COURS', 'TERMINE', 'ANNULE'],
        default: 'PLANIFIE'
    },
    items:{
        type:[OrderItemSchema],
        required:true
    },
    startedAt:{
        type:Date,
        default:null
    },
    endedAt:{
        type:Date,
        default:null
    }
},{
    timestamps:true
});

module.exports = mongoose.model('Order',OrderSchema);