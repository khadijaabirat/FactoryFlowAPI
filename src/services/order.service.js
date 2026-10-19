const mongoose = require("mongoose");
const orderRepository = require("../repositories/order.repository");
const productRepository = require("../repositories/product.repository");
const userRepository = require("../repositories/user.repository");
const materialRepository = require("../repositories/material.repository");
const stockMovementRepository = require("../repositories/stockMovement.repository");
const AppError = require("../utils/AppError");

class OrderService {
    // recuperer la recette (snapshot) pour chaque produit
    async ItemsSnapshot(items) {
        if (!Array.isArray(items) || items.length === 0) {
            throw new AppError("La liste des items est obligatoire et ne doit pas être vide", 400);
        }

        const pItems = [];

        for (const item of items) {
            if (!item.productId || !item.quantity || Number(item.quantity) <= 0) {
                throw new AppError("chaque item doit avoir un productId valide et une quantité supérieure à 0", 400);
            }

            const product = await productRepository.findById(item.productId);
            if (!product) {
                throw new AppError("produit introuvable", 404);
            }

            if (!product.composition || product.composition.length === 0) {
                throw new AppError("le produit n'a pas de recette impossible de le fabriquer.", 400);
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
                        throw new AppError("matière première introuvable pour la recette", 404);
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

            pItems.push({
                productId: item.productId,
                quantity: Number(item.quantity),
                snapshot
            });
        }

        return pItems;
    }

    // creation d'un ordre
    async createOrder(orderData) {
        if (!orderData.assignedTo) {
            throw new AppError("l'assignation à un utilisateur est obligatoire", 400);
        }

        const user = await userRepository.findById(orderData.assignedTo);
        if (!user) {
            throw new AppError("utilisateur assigné introuvable", 404);
        }

        const pItems = await this.ItemsSnapshot(orderData.items);

        const newOrderData = {
            assignedTo: orderData.assignedTo,
            status: "PLANIFIE",
            items: pItems
        };

        const order = await orderRepository.create(newOrderData);
        return order;
    }

    // lister tous les ordres
    async getAllOrders(filter = {}) {
        const orders = await orderRepository.findAll(filter);
        return orders;
    }

    // get ordre by id
    async getOrderById(id) {
        const order = await orderRepository.findById(id);
        if (!order) {
            throw new AppError("ordre introuvable", 404);
        }
        return order;
    }

    // ordres de l'operateur connecte
    async getMyOrders(operatorId) {
        const orders = await orderRepository.findByOperator(operatorId);
        return orders;
    }

    // modifier un ordre (si planifie)
    async updateOrder(id, updateData) {
        const order = await orderRepository.findById(id);
        if (!order) {
            throw new AppError("ordre introuvable", 404);
        }

        if (order.status !== "PLANIFIE") {
            throw new AppError("impossible de modifier un ordre qui n'est plus au statut planifié", 400);
        }

        const object = {};

        if (updateData.assignedTo) {
            const user = await userRepository.findById(updateData.assignedTo);
            if (!user) {
                throw new AppError("utilisateur assigné introuvable", 404);
            }
            object.assignedTo = updateData.assignedTo;
        }

        if (updateData.items) {
            object.items = await this.ItemsSnapshot(updateData.items);
        }

        const updatedOrder = await orderRepository.update(id, object);
        return updatedOrder;
    }

    // annuler un ordre
    async AnnulerOrder(id) {
        const order = await orderRepository.findById(id);
        if (!order) {
            throw new AppError("ordre introuvable", 404);
        }

        if (order.status !== "PLANIFIE") {
            throw new AppError("impossible d'annuler un ordre qui n'est plus au statut planifié", 400);
        }

        const annulerOrder = await orderRepository.update(id, { status: "ANNULE" });
        return annulerOrder;
    }

    async cancelOrder(id) {
        return await this.AnnulerOrder(id);
    }

    // supprimer un ordre
    async deleteOrder(id) {
        const order = await orderRepository.findById(id);
        if (!order) {
            throw new AppError("ordre introuvable", 404);
        }

        if (order.status !== "PLANIFIE" && order.status !== "ANNULE") {
            throw new AppError("impossible de supprimer un ordre en cours ou terminé", 400);
        }

        return await orderRepository.delete(id);
    }

    // demarrer l'ordre et deduire le stock
    async startOrder(id, performedBy) {
        const order = await orderRepository.findById(id);
        if (!order) {
            throw new AppError("ordre introuvable", 404);
        }

        // verifier que l ordre est planifie
        if (order.status !== "PLANIFIE") {
            throw new AppError("l'ordre n'est pas au statut planifié ou déjà démarré", 400);
        }

        // calculer les besoins totaux de chaque matiere
        const totalBesoins = {};

        for (const item of order.items) {
            for (const mat of item.snapshot) {
                const matId = mat.materialId.toString();
                const quantiteRequise = item.quantity * mat.quantityPerUnit;

                if (!totalBesoins[matId]) {
                    totalBesoins[matId] = {
                        materialId: mat.materialId,
                        reference: mat.reference,
                        name: mat.name,
                        quantiteTotale: 0
                    };
                }
                totalBesoins[matId].quantiteTotale += quantiteRequise;
            }
        }

        // verifier si le stock est suffisant
        for (const matId of Object.keys(totalBesoins)) {
            const besoin = totalBesoins[matId];
            const material = await materialRepository.findById(besoin.materialId);

            if (!material) {
                throw new AppError(`matière première ${besoin.reference} introuvable`, 404);
            }

            if (material.availableQuantity < besoin.quantiteTotale) {
                throw new AppError(
                    `stock insuffisant pour la matière ${besoin.reference} (${besoin.name}). disponible: ${material.availableQuantity}, requis: ${besoin.quantiteTotale}`,
                    400
                );
            }
        }

        // transaction mongo pour la deduction atomique
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            for (const matId of Object.keys(totalBesoins)) {
                const besoin = totalBesoins[matId];
                const material = await materialRepository.findById(besoin.materialId, session);

                const nouvelleQuantite = material.availableQuantity - besoin.quantiteTotale;
                await materialRepository.update(material._id, { availableQuantity: nouvelleQuantite }, session);

                await stockMovementRepository.create({
                    materialId: material._id,
                    type: "OUT",
                    quantity: besoin.quantiteTotale,
                    reason: `Fabrication ordre ${order._id}`,
                    orderId: order._id,
                    performedBy: performedBy || order.assignedTo
                }, session);
            }

            const updatedOrder = await orderRepository.update(id, {
                status: "EN_COURS",
                startedAt: new Date()
            }, session);

            await session.commitTransaction();
            return updatedOrder;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    // terminer un ordre
    async finishOrder(id) {
        const order = await orderRepository.findById(id);
        if (!order) {
            throw new AppError("ordre introuvable", 404);
        }

        if (order.status !== "EN_COURS") {
            throw new AppError("impossible de terminer un ordre qui n'est pas en cours", 400);
        }

        const finishedOrder = await orderRepository.update(id, {
            status: "TERMINE",
            endedAt: new Date()
        });

        return finishedOrder;
    }
}

module.exports = new OrderService();