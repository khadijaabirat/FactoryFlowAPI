const installationService = require('../../src/services/installation.service');
const userRepository = require('../../src/repositories/user.repository');
const bcrypt = require('bcryptjs');

jest.mock('../../src/repositories/user.repository');
jest.mock('bcryptjs');

describe('InstallationService - Tests Unitaires (FA-74)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('1. getInstallationStatus doit retourner false si aucun admin n existe', async () => {
        userRepository.countAdmins.mockResolvedValue(0);

        const status = await installationService.getInstallationStatus();
        expect(status).toBe(false);
        expect(userRepository.countAdmins).toHaveBeenCalledTimes(1);
    });

    test('2. getInstallationStatus doit retourner true si un admin existe', async () => {
        userRepository.countAdmins.mockResolvedValue(1);

        const status = await installationService.getInstallationStatus();
        expect(status).toBe(true);
    });

    test('3. instalationApplication doit créer l admin avec succès lors de la 1ère installation', async () => {
        userRepository.countAdmins.mockResolvedValue(0);
        bcrypt.hash.mockResolvedValue('hashed_password_123');
        userRepository.create.mockResolvedValue({
            _id: 'admin_id_123',
            name: 'Super Admin',
            email: 'admin@factoryflow.com',
            role: 'ADMIN'
        });

        const result = await installationService.instalationApplication({
            name: 'Super Admin',
            email: 'admin@factoryflow.com',
            password: 'Password123!'
        });

        expect(result).toHaveProperty('_id', 'admin_id_123');
        expect(result).toHaveProperty('role', 'ADMIN');
        expect(bcrypt.hash).toHaveBeenCalledWith('Password123!', 10);
        expect(userRepository.create).toHaveBeenCalledWith({
            name: 'Super Admin',
            email: 'admin@factoryflow.com',
            password: 'hashed_password_123',
            role: 'ADMIN'
        });
    });

    test('4. instalationApplication doit rejeter avec 409 si l application est déjà installée', async () => {
        userRepository.countAdmins.mockResolvedValue(1);

        await expect(installationService.instalationApplication({
            name: 'Admin 2',
            email: 'admin2@factoryflow.com',
            password: 'Password123!'
        })).rejects.toMatchObject({
            statusCode: 409,
            message: expect.stringMatching(/déja instatleé|déjà installée/i)
        });

        expect(userRepository.create).not.toHaveBeenCalled();
    });

    test('5. instalationApplication doit rejeter avec 400 si un champ est manquant', async () => {
        userRepository.countAdmins.mockResolvedValue(0);

        await expect(installationService.instalationApplication({
            name: 'Super Admin',
            email: ''
        })).rejects.toMatchObject({
            statusCode: 400
        });
    });
});
