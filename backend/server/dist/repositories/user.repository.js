import User from "../models/User.js";
class UserRepository {
    async create(userData) {
        return User.create(userData);
    }
    async findById(id) {
        return User.findById(id);
    }
    async findByEmail(email) {
        return User.findOne({
            email: email.toLowerCase(),
        }).select("+password +refreshToken");
    }
    async findByPhone(phoneNumber) {
        return User.findOne({
            phoneNumber,
        });
    }
    async emailExists(email) {
        return !!(await User.exists({
            email: email.toLowerCase(),
        }));
    }
    async phoneExists(phoneNumber) {
        return !!(await User.exists({
            phoneNumber,
        }));
    }
    async updateRefreshToken(userId, refreshToken) {
        return User.findByIdAndUpdate(userId, {
            refreshToken,
        });
    }
    async updateLastLogin(userId) {
        return User.findByIdAndUpdate(userId, {
            lastLogin: new Date(),
            $inc: {
                loginCount: 1,
            },
        });
    }
    async findAll() {
        return User.find()
            .select("-password -refreshToken")
            .sort({
            createdAt: -1,
        });
    }
    async findByIdForAdmin(id) {
        return User.findById(id)
            .select("-password -refreshToken");
    }
    async updateStatus(id, isActive) {
        return User.findByIdAndUpdate(id, {
            isActive,
            ...(isActive
                ? { deletedAt: null }
                : { deletedAt: new Date() }),
        }, {
            new: true,
            runValidators: true,
        }).select("-password -refreshToken");
    }
}
export default new UserRepository();
//# sourceMappingURL=user.repository.js.map