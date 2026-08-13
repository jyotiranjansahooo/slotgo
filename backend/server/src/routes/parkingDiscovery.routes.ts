import { Router } from "express";

import {
  getApprovedParkings,
  searchParkings,
  getParkingDetails,
  getAvailableSlots,
} from "../controllers/parking/parkingDiscovery.controller.js";
const router = Router();

router.get(
  "/",
  getApprovedParkings,
);

router.get(
  "/search",
  searchParkings,
);

router.get(
  "/:id/available-slots",
  getAvailableSlots,
);

router.get(
  "/:id",
  getParkingDetails,
);



export default router;