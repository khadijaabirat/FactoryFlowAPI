const Product = require("../models/Product");
 
class ProductRepository{

    async create(productData){
        const newProduct = await Product.create(productData);
        return newProduct;
    }
    async findAll(){
        const Products= await Product.find()
        .populate('composition.materialId','reference name unit availableQuantity')
        .sort({createdAt:-1});
        return Products;
    }
    async findById(id){
        const product =await Product.findById(id)
        .populate('composition.materialId','reference name unit availableQuantity');
        return product;
    }
    async findByReference(reference){
        const product = await Product.findOne({reference})
        return product;
        
    }
    async update(id,updateData){
        const product = await Product.findByIdAndUpdate(id,updateData,{
            new:true,
            runValidators:true
        });
        return product;
    }
    async delete(id){
        const product= await Product.findByIdAndDelete(id);
        return product;
    }
}
module.exports= new ProductRepository();