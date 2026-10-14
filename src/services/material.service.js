const materialRepository = require("../repositories/material.repository");
const AppError = require("../utils/AppError");

class materialService{

    async createMaterial(data){
        if(!data.name || !data.reference || !data.unit || !data.alertThreshold){
            throw new AppError('le nom et le reference et l unit et alert theresheld sont obligatoire ',400);
        }
        const materialr= await materialRepository.findByReference(data.reference);
        if(materialr){
            throw new AppError('une materiale est déja exist avec ce reference',409);
        }
        const material = await materialRepository.create(data);
        return material;
    }

   
    async getAllMaterials(){
        const materials= await materialRepository.findAll();
        return materials;
    }

    async getMaterialById(id){
        const material= await materialRepository.findById(id);
        if(!material){
            throw new AppError('material introvable',404);
        }
        return material;
    }

    async updateMaterial(id,updateData){
        if(updateData.reference){
            
            const materialR = await materialRepository.findByReference(updateData.reference);
            if(materialR && materialR._id.toString()!==id.toString()){
                throw new AppError('une materiale est déja exist avec ce reference',409);
            }
        }
        const newMaterial=await materialRepository.update(id,updateData);
 
        if(!newMaterial){
            throw new AppError('matiére introuvable',404);
        }
        return newMaterial;
 
   }

    async deleteMaterial(id){
      const materialD=  await materialRepository.delete(id);
      if(!materialD){
        throw new AppError('la matirial nexist pas',404);
      }
      return materialD;
    }


    async getLowStockMaterials(){
        const materials= await materialRepository.findLowStock();
        return materials;
    }
}
module.exports= new materialService();