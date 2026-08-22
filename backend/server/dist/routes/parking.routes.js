import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";
import requireRole from "../middleware/role.middleware.js";
import { USER_ROLES } from "../constants/roles.js";
import { createParkingSchema } from "../validations/parking/create.validation.js";
import { updateParkingSchema } from "../validations/parking/update.validation.js";
import { createParking, getMyParkings, getParking, updateParking, deleteParking, } from "../controllers/parking/parking.controller.js";
const router = Router();
// ==========================================================
// PARKING OWNER AUTHORIZATION
// ==========================================================
router.use(authMiddleware, requireRole(USER_ROLES.PARKING_OWNER));
// ==========================================================
// CREATE PARKING
// ==========================================================
router.post("/", validate(createParkingSchema), createParking);
// ==========================================================
// GET MY PARKINGS
// ==========================================================
router.get("/", getMyParkings);
// ==========================================================
// GET SINGLE PARKING
// ==========================================================
router.get("/:id", getParking);
// ==========================================================
// UPDATE PARKING
// ==========================================================
router.patch("/:id", validate(updateParkingSchema), updateParking);
// ==========================================================
// DEACTIVATE PARKING
// ==========================================================
router.delete("/:id", deleteParking);
export default router;
//# sourceMappingURL=parking.routes.js.map