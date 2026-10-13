const Material = require("../models/Material");
 
class MaterialRepository{

    async create(materialData){
const material = await Material.create(materialData);
return material;
    }

async findAll(){
        const Materials=await Material.find();
        return Materials;
    }

async findById(id){
        const material = await Material.findById(id);
        return material;
    }


async findByReference(reference){
    const material = await Material.findOne({reference});
    return material;
}


async update(id,updateData){
    const material= await Material.findByIdAndUpdate(id,updateData,{
        new:true,
        runValidators:true
    });
   return material;
}


async delete(id){
    const material= await Material.findByIdAndDelete(id);
    return material;
}


async findLowStock(){
    const materials= await Material.find({$expr:{$lte:["$availableQuantity","$alertThreshold"]}});
    return materials;
}
}

module.exports=new MaterialRepository();