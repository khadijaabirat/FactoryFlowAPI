const mongoose= require('mongoose');
const CompositionItemSchema= new mongoose.Schema({
materialId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Material',
    required:true
},
quantity:{
    type:Number,
    required:true,
    min:0.001
}});

const ProductSchema= new mongoose.Schema({
reference:{
    type:String,
    required:true,
    trim:true,
    unique:true,
    uppercase:true
},
name:{
    type:String,
    required:true,
    trim:true
},
composition: [CompositionItemSchema],
},{timestamps:true});
module.exports=mongoose.model('Product',ProductSchema);