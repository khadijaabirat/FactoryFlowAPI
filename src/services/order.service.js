const mongoose = require("mongoose");
const orderRepository = require("../repositories/order.repository");
const productRepository = require("../repositories/product.repository");
const userRepository = require("../repositories/user.repository");
const materialRepository = require("../repositories/material.repository");
const stockMovementRepository = require("../repositories/stockMovement.repository");
const AppError = require("../utils/AppError");

class OrderService {
    /**
     * Récupère la recette figée (snapshot) pour chaque produit
     */
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

    /**
     * FA-57: Création d'un ordre
     */
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

    /**
     * FA-59: Liste des ordres avec filtres
     */
    async getAllOrders(filter = {}) {
        const orders = await orderRepository.findAll(filter);
        return orders;
    }

    /**
     * Détail d'un ordre
     */
    async getOrderById(id) {
        const order = await orderRepository.findById(id);
        if (!order) {
            throw new AppError("ordre introuvable", 404);
        }
        return order;
    }

    /**
     * Ordres de l'opérateur connecté
     */
    async getMyOrders(operatorId) {
        const orders = await orderRepository.findByOperator(operatorId);
        return orders;
    }

    /**
     * FA-58: Modifier un ordre (uniquement si PLANIFIE)
     */
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

    /**
     * FA-58: Annuler un ordre (uniquement si PLANIFIE)
     */
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

    // Alias pour compatibilité
    async cancelOrder(id) {
        return await this.AnnulerOrder(id);
    }

    /**
     * Supprimer un ordre (uniquement si PLANIFIE ou ANNULE)
     */
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

    /**
     * FA-60: Démarrage d'ordre et déduction atomique de stock (ACID)
     */
    async startOrder(id, performedBy) {
        // 1. Récupérer l'ordre
        const order = await orderRepository.findById(id);
        if (!order) {
            throw new AppError("ordre introuvable", 404);
        }

        // FA-64: Vérifier que l'ordre est au statut PLANIFIE
        if (order.status !== "PLANIFIE") {
            throw new AppError("l'ordre n'est pas au statut planifié ou déjà démarré", 400);
        }

        // FA-61: Calculer le total des besoins en matières pour tous les items
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

        // FA-62: Vérifier le stock disponible AVANT de modifier quoi que ce soit
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

        // FA-63: Déduction atomique avec transaction ACID MongoDB
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Pour chaque matière : déduire le stock et enregistrer le mouvement OUT
            for (const matId of Object.keys(totalBesoins)) {
                const besoin = totalBesoins[matId];
                const material = await materialRepository.findById(besoin.materialId, session);

                // Déduction du stock
                const nouvelleQuantite = material.availableQuantity - besoin.quantiteTotale;
                await materialRepository.update(material._id, { availableQuantity: nouvelleQuantite }, session);

                // Mouvement de stock OUT
                await stockMovementRepository.create({
                    materialId: material._id,
                    type: "OUT",
                    quantity: besoin.quantiteTotale,
                    reason: `Fabrication ordre ${order._id}`,
                    orderId: order._id,
                    performedBy: performedBy || order.assignedTo
                }, session);
            }

            // Mettre à jour l'ordre : statut EN_COURS et startedAt
            const updatedOrder = await orderRepository.update(id, {
                status: "EN_COURS",
                startedAt: new Date()
            }, session);

            // Valider la transaction ACID
            await session.commitTransaction();
            return updatedOrder;
        } catch (error) {
            // En cas d'erreur : annuler tout (Rollback)
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    /**
     * FA-67: Clôture de l'ordre (passage à TERMINE et endedAt)
     */
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