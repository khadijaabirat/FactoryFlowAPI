const mongoose = require('mongoose');
const orderService = require('../../src/services/order.service');
const orderRepository = require('../../src/repositories/order.repository');
const materialRepository = require('../../src/repositories/material.repository');
const stockMovementRepository = require('../../src/repositories/stockMovement.repository');
const productRepository = require('../../src/repositories/product.repository');
const userRepository = require('../../src/repositories/user.repository');

jest.mock('../../src/repositories/order.repository');
jest.mock('../../src/repositories/material.repository');
jest.mock('../../src/repositories/stockMovement.repository');
jest.mock('../../src/repositories/product.repository');
jest.mock('../../src/repositories/user.repository');

describe('OrderService - Tests Unitaires (FA-72 & FA-73)', () => {
    let mockSession;

    beforeEach(() => {
        jest.clearAllMocks();

        mockSession = {
            startTransaction: jest.fn(),
            commitTransaction: jest.fn(),
            abortTransaction: jest.fn(),
            endSession: jest.fn()
        };

        jest.spyOn(mongoose, 'startSession').mockResolvedValue(mockSession);
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    describe('FA-72 : Calcul des besoins multi-produits et rejet stock insuffisant', () => {
        test('doit agréger correctement les besoins de plusieurs produits et rejeter si stock insuffisant', async () => {
            const fakeOrder = {
                _id: 'order_123',
                status: 'PLANIFIE',
                assignedTo: 'user_456',
                items: [
                    {
                        productId: 'prod_A',
                        quantity: 5,
                        snapshot: [
                            {
                                materialId: 'mat_acier',
                                reference: 'MP-ACIER',
                                name: 'Acier Inox',
                                unit: 'kg',
                                quantityPerUnit: 2
                            }
                        ]
                    },
                    {
                        productId: 'prod_B',
                        quantity: 10,
                        snapshot: [
                            {
                                materialId: 'mat_acier',
                                reference: 'MP-ACIER',
                                name: 'Acier Inox',
                                unit: 'kg',
                                quantityPerUnit: 3
                            }
                        ]
                    }
                ]
            };

            orderRepository.findById.mockResolvedValue(fakeOrder);

            // Stock disponible = 30 kg, mais le besoin total = (5 * 2) + (10 * 3) = 40 kg
            materialRepository.findById.mockResolvedValue({
                _id: 'mat_acier',
                reference: 'MP-ACIER',
                name: 'Acier Inox',
                availableQuantity: 30
            });

            await expect(orderService.startOrder('order_123', 'operator_789'))
                .rejects
                .toMatchObject({
                    statusCode: 400,
                    message: expect.stringMatching(/stock insuffisant/i)
                });

            // Vérifier qu'aucune transaction n'a été validée et aucun mouvement n'a été créé
            expect(mockSession.commitTransaction).not.toHaveBeenCalled();
            expect(stockMovementRepository.create).not.toHaveBeenCalled();
            expect(materialRepository.update).not.toHaveBeenCalled();
        });
    });

    describe('FA-73 : Démarrage réussi et rejet second démarrage (FA-64)', () => {
        test('doit déduire le stock, créer les mouvements OUT et passer à EN_COURS si stock suffisant', async () => {
            const fakeOrder = {
                _id: 'order_123',
                status: 'PLANIFIE',
                assignedTo: 'user_456',
                items: [
                    {
                        productId: 'prod_A',
                        quantity: 4,
                        snapshot: [
                            {
                                materialId: 'mat_joint',
                                reference: 'MP-JOINT',
                                name: 'Joint Torique',
                                unit: 'pièce',
                                quantityPerUnit: 2.5
                            }
                        ]
                    }
                ]
            };

            orderRepository.findById.mockResolvedValue(fakeOrder);

            // Besoin = 4 * 2.5 = 10 pièces. Stock disponible = 50 pièces.
            materialRepository.findById.mockResolvedValue({
                _id: 'mat_joint',
                reference: 'MP-JOINT',
                name: 'Joint Torique',
                availableQuantity: 50
            });

            orderRepository.update.mockResolvedValue({
                ...fakeOrder,
                status: 'EN_COURS',
                startedAt: new Date()
            });

            const result = await orderService.startOrder('order_123', 'operator_789');

            expect(result.status).toBe('EN_COURS');
            expect(mockSession.startTransaction).toHaveBeenCalled();
            expect(mockSession.commitTransaction).toHaveBeenCalled();
            expect(mockSession.endSession).toHaveBeenCalled();

            // Vérifier la déduction exacte : 50 - 10 = 40
            expect(materialRepository.update).toHaveBeenCalledWith(
                'mat_joint',
                { availableQuantity: 40 },
                mockSession
            );

            // Vérifier le mouvement OUT créé
            expect(stockMovementRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    materialId: 'mat_joint',
                    type: 'OUT',
                    quantity: 10,
                    orderId: 'order_123',
                    performedBy: 'operator_789'
                }),
                mockSession
            );
        });

        test('FA-64 : doit rejeter tout second démarrage pour un ordre déjà EN_COURS', async () => {
            orderRepository.findById.mockResolvedValue({
                _id: 'order_123',
                status: 'EN_COURS',
                items: []
            });

            await expect(orderService.startOrder('order_123', 'operator_789'))
                .rejects
                .toMatchObject({
                    statusCode: 400,
                    message: expect.stringMatching(/pas au statut planifié ou déjà démarré/i)
                });

            expect(mockSession.startTransaction).not.toHaveBeenCalled();
        });

        test('FA-64 : doit rejeter le démarrage pour un ordre déjà TERMINE', async () => {
            orderRepository.findById.mockResolvedValue({
                _id: 'order_123',
                status: 'TERMINE',
                items: []
            });

            await expect(orderService.startOrder('order_123', 'operator_789'))
                .rejects
                .toMatchObject({
                    statusCode: 400
                });
        });
    });

    describe('FA-67 : Clôture d ordre (finishOrder)', () => {
        test('doit passer l ordre au statut TERMINE avec horodatage endedAt', async () => {
            orderRepository.findById.mockResolvedValue({
                _id: 'order_123',
                status: 'EN_COURS'
            });

            orderRepository.update.mockResolvedValue({
                _id: 'order_123',
                status: 'TERMINE',
                endedAt: new Date()
            });

            const result = await orderService.finishOrder('order_123');

            expect(result.status).toBe('TERMINE');
            expect(orderRepository.update).toHaveBeenCalledWith(
                'order_123',
                expect.objectContaining({
                    status: 'TERMINE',
                    endedAt: expect.any(Date)
                })
            );
        });

        test('doit rejeter la clôture si l ordre n est pas EN_COURS', async () => {
            orderRepository.findById.mockResolvedValue({
                _id: 'order_123',
                status: 'PLANIFIE'
            });

            await expect(orderService.finishOrder('order_123'))
                .rejects
                .toMatchObject({
                    statusCode: 400,
                    message: expect.stringMatching(/impossible de terminer un ordre qui n'est pas en cours/i)
                });
        });
    });
});
