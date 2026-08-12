import dotenv from "dotenv";
import connectDatabase from "../config/database.js";
import User from "../models/User.js";
import { USER_ROLES } from "../constants/roles.js";
dotenv.config();
const seedAdmin = async () => {
    try {
        await connectDatabase();
        const email = "admin@slotgo.com";
        const phoneNumber = "9856441546";
        const password = "Admin@1234";
        const existingAdmin = await User.findOne({
            role: USER_ROLES.ADMIN,
        });
        if (existingAdmin) {
            console.log("Admin already exists.");
            process.exit(0);
        }
        const existingEmail = await User.findOne({
            email,
        });
        if (existingEmail) {
            console.error("Cannot create admin: email already exists.");
            process.exit(1);
        }
        const existingPhone = await User.findOne({
            phoneNumber,
        });
        if (existingPhone) {
            console.error("Cannot create admin: phone number already exists.");
            process.exit(1);
        }
        const admin = await User.create({
            name: {
                first: "SlotGo",
                last: "Admin",
            },
            email,
            phoneNumber,
            password,
            role: USER_ROLES.ADMIN,
            isVerified: true,
            verifiedAt: new Date(),
            isActive: true,
            loginCount: 0,
        });
        console.log("====================================");
        console.log("Admin created successfully");
        console.log("====================================");
        console.log(`Email    : ${admin.email}`);
        console.log(`Role     : ${admin.role}`);
        console.log("====================================");
        process.exit(0);
    }
    catch (error) {
        console.error("Admin seed failed:", error);
        process.exit(1);
    }
};
seedAdmin();
//# sourceMappingURL=seedAdmin.js.map