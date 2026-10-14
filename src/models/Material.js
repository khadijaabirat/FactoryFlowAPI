const mongoose = require('mongoose');
 
const materialschema = new mongoose.Schema(
    {
        reference:{
            type:String,
            required:true,
            unique:true,
            uppercase:true,
            trim:true
        },
        name:{
            type:String,
            required:true,
            trim:true
        },
        unit:{
            type:String,
            required:true,
            trim:true
        },
        availableQuantity:{
            type:Number,
            default:0,
            min:0
        },
        alertThreshold:{
            type:Number,
            required:true,
            min:0
        }

},{
    timestamps:true
});

module.exports=mongoose.model('Material',materialschema);