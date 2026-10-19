const orderRepository = require("../repositories/order.repository");
const productRepository = require("../repositories/product.repository");
const userRepository = require("../repositories/user.repository");
const materialRepository = require("../repositories/material.repository");
const AppError = require("../utils/AppError");

class OrderService {
    /**
     * Construit les items avec leur snapshot figé (BOM) au moment de la création ou modification
     */
    async buildItemsWithSnapshot(items) {
        if (!Array.isArray(items) || items.length === 0) {
            throw new AppError("La liste des items est obligatoire et ne doit pas être vide", 400);
        }

        const processedItems = [];

        for (const item of items) {
            if (!item.productId || !item.quantity || Number(item.quantity) <= 0) {
                throw new AppError("Chaque item doit avoir un productId valide et une quantité supérieure à 0", 400);
            }

            const product = await productRepository.findById(item.productId);
            if (!product) {
                throw new AppError(`Produit ${item.productId} introuvable`, 404);
            }

            if (!product.composition || product.composition.length === 0) {
                throw new AppError(`Le produit "${product.name}" (${product.reference}) n'a pas de recette (BOM). Impossible de le fabriquer.`, 400);
            }

            const snapshot = [];
            for (const comp of product.composition) {
                const mat = comp.materialId;
                const materialId = mat._id || mat;
                let reference = mat.reference;
                let name = mat.name;
                let unit = mat.unit;

                if (!reference || !name || !unit) {
                    const foundMat = await materialRepository.findById(materialId);
                    if (!foundMat) {
                        throw new AppError(`Matière première ${materialId} introuvable pour la recette`, 404);
                    }
                    reference = foundMat.reference;
                    name = foundMat.name;
                    unit = foundMat.unit;
                }

                snapshot.push({
                    materialId,
                    reference,
                    name,
                    unit,
                    quantityPerUnit: comp.quantity
                });
            }

            processedItems.push({
                productId: item.productId,
                quantity: Number(item.quantity),
                snapshot
            });
        }

        return processedItems;
    }

    /**
     * FA-57: Création d'un ordre multi-produits avec copie figée du snapshot
     */
    async createOrder(orderData) {
        if (!orderData.assignedTo) {
            throw new AppError("L'assignation à un utilisateur (assignedTo) est obligatoire", 400);
        }

        const user = await userRepository.findById(orderData.assignedTo);
        if (!user) {
            throw new AppError("Utilisateur assigné introuvable", 404);
        }

        const processedItems = await this.buildItemsWithSnapshot(orderData.items);

        const newOrderData = {
            assignedTo: orderData.assignedTo,
            status: "PLANIFIE",
            items: processedItems
        };

        const order = await orderRepository.create(newOrderData);
        return order;
    }

    /**
     * FA-59: Consultation globale des ordres avec filtres optionnels
     */
    async getAllOrders(filter = {}) {
        const orders = await orderRepository.findAll(filter);
        return orders;
    }

    /**
     * Consultation d'un ordre par ID
     */
    async getOrderById(id) {
        const order = await orderRepository.findById(id);
        if (!order) {
            throw new AppError("Ordre de fabrication introuvable", 404);
        }
        return order;
    }

    /**
     * Consultation des ordres affectés à un opérateur
     */
    async getMyOrders(operatorId) {
        const orders = await orderRepository.findByOperator(operatorId);
        return orders;
    }

    /**
     * FA-58: Modification d'ordre (autorisé uniquement si statut PLANIFIE)
     */
    async updateOrder(id, updateData) {
        const existingOrder = await orderRepository.findById(id);
        if (!existingOrder) {
            throw new AppError("Ordre de fabrication introuvable", 404);
        }

        if (existingOrder.status !== "PLANIFIE") {
            throw new AppError("Impossible de modifier un ordre qui n'est plus au statut PLANIFIE", 400);
        }

        const payload = {};

        if (updateData.assignedTo) {
            const user = await userRepository.findById(updateData.assignedTo);
            if (!user) {
                throw new AppError("Utilisateur assigné introuvable", 404);
            }
            payload.assignedTo = updateData.assignedTo;
        }

        if (updateData.items) {
            payload.items = await this.buildItemsWithSnapshot(updateData.items);
        }

        const updatedOrder = await orderRepository.update(id, payload);
        return updatedOrder;
    }

    /**
     * FA-58: Annulation d'ordre (autorisé uniquement si statut PLANIFIE)
     */
    async cancelOrder(id) {
        const existingOrder = await orderRepository.findById(id);
        if (!existingOrder) {
            throw new AppError("Ordre de fabrication introuvable", 404);
        }

        if (existingOrder.status !== "PLANIFIE") {
            throw new AppError("Impossible d'annuler un ordre qui n'est plus au statut PLANIFIE", 400);
        }

        const cancelledOrder = await orderRepository.update(id, { status: "ANNULE" });
        return cancelledOrder;
    }

    /**
     * Suppression d'ordre (autorisé uniquement si PLANIFIE ou ANNULE)
     */
    async deleteOrder(id) {
        const existingOrder = await orderRepository.findById(id);
        if (!existingOrder) {
            throw new AppError("Ordre de fabrication introuvable", 404);
        }

        if (existingOrder.status !== "PLANIFIE" && existingOrder.status !== "ANNULE") {
            throw new AppError("Impossible de supprimer un ordre en cours ou terminé", 400);
        }

        return await orderRepository.delete(id);
    }
}

module.exports = new OrderService();