const orderService = require("../services/order.service");
const asyncHandler = require("../utils/asyncHandler");

const createOrder = asyncHandler(async (req, res, next) => {
    const order = await orderService.createOrder(req.body);
    return res.status(201).json({
        success: true,
        message: "Ordre de fabrication créé avec succès",
        order
    });
});

const getAllOrders = asyncHandler(async (req, res, next) => {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.assignedTo) filter.assignedTo = req.query.assignedTo;

    const orders = await orderService.getAllOrders(filter);
    return res.status(200).json({
        success: true,
        count: orders.length,
        orders
    });
});

const getOrderById = asyncHandler(async (req, res, next) => {
    const order = await orderService.getOrderById(req.params.id);
    return res.status(200).json({
        success: true,
        order
    });
});

const getMyOrders = asyncHandler(async (req, res, next) => {
    const operatorId = req.user.id || req.user._id;
    const orders = await orderService.getMyOrders(operatorId);
    return res.status(200).json({
        success: true,
        count: orders.length,
        orders
    });
});

const updateOrder = asyncHandler(async (req, res, next) => {
    const order = await orderService.updateOrder(req.params.id, req.body);
    return res.status(200).json({
        success: true,
        message: "Ordre modifié avec succès",
        order
    });
});

const cancelOrder = asyncHandler(async (req, res, next) => {
    const order = await orderService.cancelOrder(req.params.id);
    return res.status(200).json({
        success: true,
        message: "Ordre annulé avec succès",
        order
    });
});

const deleteOrder = asyncHandler(async (req, res, next) => {
    await orderService.deleteOrder(req.params.id);
    return res.status(200).json({
        success: true,
        message: "Ordre supprimé avec succès"
    });
});

const startOrder = asyncHandler(async (req, res, next) => {
    const operatorId = req.user.id || req.user._id;
    const order = await orderService.startOrder(req.params.id, operatorId);
    return res.status(200).json({
        success: true,
        message: "ordre démarré avec succès",
        order
    });
});

const finishOrder = asyncHandler(async (req, res, next) => {
    const order = await orderService.finishOrder(req.params.id);
    return res.status(200).json({
        success: true,
        message: "ordre terminé avec succès",
        order
    });
});

module.exports = {
    createOrder,
    getAllOrders,
    getOrderById,
    getMyOrders,
    updateOrder,
    cancelOrder,
    deleteOrder,
    startOrder,
    finishOrder
};
