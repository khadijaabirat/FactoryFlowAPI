const productService = require("../services/product.service");
const asyncHandler = require("../utils/asyncHandler");

 const createProduct= asyncHandler(async(req,res,next)=>{
    const newProduct=await productService.createProduct(req.body);
    return res.status(201).json({
        success:true,
        message:'le product creé avec success',
        newProduct
        });

 });

 const getAllProduct=asyncHandler(async(req ,res ,next)=>{
    const Products=await productService.getAllProduct();
    return res.status(200).json({
        success:true,
        count:Products.length,
        Products
    });
 });


 const getProductById = asyncHandler(async(req , res , next)=>{
    const product = await productService.getProductById(req.params.id);
    return res.status(200).json({
        success:true,
        product
    });
 });


 const updateProduct=asyncHandler(async(req , res , next)=>{
    const productupdate= await productService.updateProduct(req.params.id,req.body);
    return res.status(200).json({
        success:true,
        message:'le produit est modifier acvec success',
        productupdate
    });
 });

 const deleteProduct = asyncHandler(async(req , res , next)=>{
    const productdelete= await productService.deleteProduct(req.params.id);
    return res.status(200).json({
        success:true,
        message:'le produit est supprimé avec success',
        productdelete
    });
 });

 const updateCompsitionProduct= asyncHandler(async(req , res , next)=>{
    let items = req.body;
if (req.body.items) {
  items = req.body.items;
}
    const product= await productService.updateCompsitionProduct(req.params.id,items);
    return res.status(200).json({
        success:true,
        message:'la composition de ce produite modifier avec success',
        product
    });
 });

 module.exports={
    createProduct,
    getAllProduct,
    getProductById,
    updateProduct,
    deleteProduct,
    updateCompsitionProduct

 }
