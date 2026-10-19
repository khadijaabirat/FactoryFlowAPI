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

async findById(id, session = null){
        let query = Material.findById(id);
        if (session) query = query.session(session);
        return await query;
    }


async findByReference(reference){
    const material = await Material.findOne({reference});
    return material;
}


async update(id, updateData, session = null){
    const options = { new: true, runValidators: true };
    if (session) options.session = session;
    const material = await Material.findByIdAndUpdate(id, updateData, options);
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