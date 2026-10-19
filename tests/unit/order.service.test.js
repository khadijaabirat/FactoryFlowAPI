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

describe('Order Service', () => {
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

    describe('Verification et calcul des matieres', () => {
        test('doit rejeter si le stock est insuffisant pour les produits', async () => {
            const fakeOrder = {
                _id: 'order1',
                status: 'PLANIFIE',
                assignedTo: 'user1',
                items: [
                    {
                        productId: 'prod1',
                        quantity: 5,
                        snapshot: [
                            {
                                materialId: 'mat1',
                                reference: 'MP-ACIER',
                                name: 'Acier',
                                unit: 'kg',
                                quantityPerUnit: 2
                            }
                        ]
                    },
                    {
                        productId: 'prod2',
                        quantity: 10,
                        snapshot: [
                            {
                                materialId: 'mat1',
                                reference: 'MP-ACIER',
                                name: 'Acier',
                                unit: 'kg',
                                quantityPerUnit: 3
                            }
                        ]
                    }
                ]
            };

            orderRepository.findById.mockResolvedValue(fakeOrder);

            // stock = 30 mais besoin = 5*2 + 10*3 = 40
            materialRepository.findById.mockResolvedValue({
                _id: 'mat1',
                reference: 'MP-ACIER',
                name: 'Acier',
                availableQuantity: 30
            });

            await expect(orderService.startOrder('order1', 'user1'))
                .rejects
                .toMatchObject({
                    statusCode: 400
                });

            expect(mockSession.commitTransaction).not.toHaveBeenCalled();
            expect(stockMovementRepository.create).not.toHaveBeenCalled();
        });
    });

    describe('Demarrage de l ordre', () => {
        test('doit deduire le stock et passer en cours si stock disponible', async () => {
            const fakeOrder = {
                _id: 'order1',
                status: 'PLANIFIE',
                assignedTo: 'user1',
                items: [
                    {
                        productId: 'prod1',
                        quantity: 4,
                        snapshot: [
                            {
                                materialId: 'mat1',
                                reference: 'MP-JOINT',
                                name: 'Joint',
                                unit: 'piece',
                                quantityPerUnit: 2.5
                            }
                        ]
                    }
                ]
            };

            orderRepository.findById.mockResolvedValue(fakeOrder);

            // besoin = 10, stock = 50
            materialRepository.findById.mockResolvedValue({
                _id: 'mat1',
                reference: 'MP-JOINT',
                name: 'Joint',
                availableQuantity: 50
            });

            orderRepository.update.mockResolvedValue({
                ...fakeOrder,
                status: 'EN_COURS',
                startedAt: new Date()
            });

            const result = await orderService.startOrder('order1', 'user1');

            expect(result.status).toBe('EN_COURS');
            expect(mockSession.startTransaction).toHaveBeenCalled();
            expect(mockSession.commitTransaction).toHaveBeenCalled();
            expect(materialRepository.update).toHaveBeenCalledWith(
                'mat1',
                { availableQuantity: 40 },
                mockSession
            );
            expect(stockMovementRepository.create).toHaveBeenCalled();
        });

        test('doit rejeter si l ordre est deja en cours', async () => {
            orderRepository.findById.mockResolvedValue({
                _id: 'order1',
                status: 'EN_COURS',
                items: []
            });

            await expect(orderService.startOrder('order1', 'user1'))
                .rejects
                .toMatchObject({
                    statusCode: 400
                });
        });

        test('doit rejeter si l ordre est deja termine', async () => {
            orderRepository.findById.mockResolvedValue({
                _id: 'order1',
                status: 'TERMINE',
                items: []
            });

            await expect(orderService.startOrder('order1', 'user1'))
                .rejects
                .toMatchObject({
                    statusCode: 400
                });
        });
    });

    describe('Cloture de l ordre', () => {
        test('doit terminer l ordre si en cours', async () => {
            orderRepository.findById.mockResolvedValue({
                _id: 'order1',
                status: 'EN_COURS'
            });

            orderRepository.update.mockResolvedValue({
                _id: 'order1',
                status: 'TERMINE',
                endedAt: new Date()
            });

            const result = await orderService.finishOrder('order1');
            expect(result.status).toBe('TERMINE');
        });

        test('doit rejeter si l ordre n est pas en cours', async () => {
            orderRepository.findById.mockResolvedValue({
                _id: 'order1',
                status: 'PLANIFIE'
            });

            await expect(orderService.finishOrder('order1'))
                .rejects
                .toMatchObject({
                    statusCode: 400
                });
        });
    });
});
