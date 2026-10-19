const installationService = require('../../src/services/installation.service');
const userRepository = require('../../src/repositories/user.repository');
const bcrypt = require('bcryptjs');

jest.mock('../../src/repositories/user.repository');
jest.mock('bcryptjs');

describe('Installation Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('retourne false si aucun admin n existe', async () => {
        userRepository.countAdmins.mockResolvedValue(0);

        const status = await installationService.getInstallationStatus();
        expect(status).toBe(false);
    });

    test('retourne true si admin existe deja', async () => {
        userRepository.countAdmins.mockResolvedValue(1);

        const status = await installationService.getInstallationStatus();
        expect(status).toBe(true);
    });

    test('creer admin avec succes', async () => {
        userRepository.countAdmins.mockResolvedValue(0);
        bcrypt.hash.mockResolvedValue('hash123');
        userRepository.create.mockResolvedValue({
            _id: 'admin1',
            name: 'Admin',
            email: 'admin@gmail.com',
            role: 'ADMIN'
        });

        const result = await installationService.instalationApplication({
            name: 'Admin',
            email: 'admin@gmail.com',
            password: 'password123'
        });

        expect(result._id).toBe('admin1');
        expect(result.role).toBe('ADMIN');
    });

    test('rejeter si application deja installee', async () => {
        userRepository.countAdmins.mockResolvedValue(1);

        await expect(installationService.instalationApplication({
            name: 'Admin 2',
            email: 'admin2@gmail.com',
            password: 'password123'
        })).rejects.toMatchObject({
            statusCode: 409
        });
    });

    test('rejeter si champs manquants', async () => {
        userRepository.countAdmins.mockResolvedValue(0);

        await expect(installationService.instalationApplication({
            name: 'Admin'
        })).rejects.toMatchObject({
            statusCode: 400
        });
    });
});
