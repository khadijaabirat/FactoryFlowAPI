const materialService = require("../services/material.service");
const asyncHandler = require("../utils/asyncHandler");

const createMaterial= asyncHandler(async(req,res,next)=>{
    const material=await materialService.createMaterial(req.body);
    return res.status(201).json({
        success:true,
        message:'matiere creé avec succés',
        data:material
    });
})

const getAllMaterials= asyncHandler(async(req,res,next)=>{
const materials= await materialService.getAllMaterials();
return res.status(200).json({
    success:true,
    count:materials.length,
    data: materials
});
});


const getMaterialById = asyncHandler(async(req,res,next)=>{
    const material= await materialService.getMaterialById(req.params.id);
    return res.status(200).json({
        success:true,
        data:material
    });
});


const updateMaterial= asyncHandler(async(req,res,next)=>{
    const id= req.params.id;
    const data = req.body;
    const material= await materialService.updateMaterial(id,data);
    return res.status(200).json({
        success:true,
        message:'material modifié avec succés',
        data:material
    });
});


const deleteMaterial= asyncHandler(async(req,res,next)=>{
    const material=await materialService.deleteMaterial(req.params.id);
    return res.status(200).json({
        success:true,
        message:'material supprimer avec succés'
    });
});


const getLowStockMaterials= asyncHandler(async(req,res,next)=>{
    const lowstockmaterials= await materialService.getLowStockMaterials();
    return res.status(200).json({
        success:true,
        count:lowstockmaterials.length,
        data:lowstockmaterials
    })
})
module.exports={
    createMaterial,
    getAllMaterials,
    getMaterialById,
    updateMaterial,
    deleteMaterial,
    getLowStockMaterials
}