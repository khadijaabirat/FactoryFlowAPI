const materialRepository = require("../repositories/material.repository");
const productRepository = require("../repositories/product.repository");
const AppError = require("../utils/AppError");

class productService{
async validateComposition(items){
    const array=[];
    for(let i of items){

        if(i.quantity<=0 || !i.materialId){
            throw new AppError('materialId et obligatoire et la quantity doit etre supérieur a 0',400);
        }
        const materialId = await materialRepository.findById(i.materialId);
        if(!materialId){
            throw new AppError('cette matiriale introuvable ',400);
        }  
        const id= i.materialId.toString();
        if(array.includes(id)){
            throw new AppError('doublon de matiére dans la compositon',400);
        }
        array.push(id);

    }
 
}
async createProduct(productData){
    if(!productData.name || !productData.reference){
        throw new AppError('le nom et reference sont obligatoire',400);
    }
    const ref=await productRepository.findByReference(productData.reference);
    if(ref){
        throw new AppError('ce reference déja exist',409);
    }
    if(productData.composition){
        await this.validateComposition(productData.composition);
    }
    const product = await productRepository.create(productData);
    return product

}
async getAllProduct(){
    const Products= await productRepository.findAll();
    return Products;
}
async getProductById(id){
    const product=await productRepository.findById(id);
    if(!product){
        throw new AppError('ce product introuvable',404);
    }
    return product;
}
async updateProduct(id,updateData){
    const newProduct = await productRepository.update(id,updateData);
    if(!newProduct){
        throw new AppError('ce product introuvable',404);
    }
    return newProduct;
}
async deleteProduct(id){
    const product=await productRepository.delete(id);
    if(!product){
        throw new AppError('ce product introuvable',404);
    }
    return product;
}
async updateCompsitionProduct(productId,items){
    await this.validateComposition(items);
    const product = await productRepository.update(productId,{composition:items});
    return product;
}
}
module.exports=new productService();