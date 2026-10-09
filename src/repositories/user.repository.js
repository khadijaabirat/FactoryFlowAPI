const User = require('../models/User');
class UserRepository {
    async countAdmins() {
        const countAdmins = await User.countDocuments({ role: 'ADMIN' });
        return countAdmins;
    }
    async findByEmail(email) {
        const user = await User.findOne({ email: email });
        return user;
    }

    async create(userData) {
        const newUser = await User.create(userData);
        return newUser;
    }
    async findById(id) {
        const user = await User.findById(id);
        return user;
    }
}
module.exports = new UserRepository();