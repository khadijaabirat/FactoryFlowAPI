const Order = require("../models/Order");

class OrderRepository{
    async create(orderData,session=null){
     const order = new Order(orderData);
if (session) {
    return await order.save({session});
}
return await order.save();
    }

    async findAll(filter={}){
        const orders = await Order.find(filter)
                        .populate('assignedTo','name email role')
                        .populate('items.productId','reference name')
                        .sort({createdAt:-1});
        return orders
    }

    async findById(id,session=null){
        let query = Order.findById(id)
                        .populate('assignedTo','name email role')
                        .populate('items.productId','reference name');
        if (session) {
            query = query.session(session);
        }
        return await query;
    }

    async findByOperator(operatorId){
        const orders = await Order.find({assignedTo:operatorId})
                        .populate('assignedTo','name email role')
                        .populate('items.productId','reference name')
                        .sort({createdAt:-1});
        return orders;
    }
    async update(id,updateData,session=null){
 const options = { new: true, runValidators: true };
if (session) options.session = session;
        const neworder= await Order.findByIdAndUpdate(id,updateData,options);
        return neworder;
    }


    async delete(id){
        const order= await Order.findByIdAndDelete(id);
        return order;
    }
}

module.exports= new OrderRepository();