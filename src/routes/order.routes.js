const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");
const { authenticate, authorise } = require("../middlewares/auth.middleware");

// Route pour l'opérateur connecté (AVANT /:id)
router.get("/my-orders", authenticate, orderController.getMyOrders);

// Routes de gestion du cycle de vie des ordres
router.post("/:id/start", authenticate, orderController.startOrder);
router.patch("/:id/start", authenticate, orderController.startOrder);
router.post("/:id/finish", authenticate, orderController.finishOrder);
router.patch("/:id/finish", authenticate, orderController.finishOrder);

// Routes d'administration des ordres
router.post("/", authenticate, authorise("ADMIN"), orderController.createOrder);
router.get("/", authenticate, authorise("ADMIN"), orderController.getAllOrders);
router.get("/:id", authenticate, orderController.getOrderById);
router.put("/:id", authenticate, authorise("ADMIN"), orderController.updateOrder);
router.post("/:id/cancel", authenticate, authorise("ADMIN"), orderController.cancelOrder);
router.delete("/:id", authenticate, authorise("ADMIN"), orderController.deleteOrder);

module.exports = router;
