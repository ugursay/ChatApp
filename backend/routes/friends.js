import express from "express";
import {
  sendFriendRequest,
  acceptFriendRequest,
  getFriends,
  getPendingRequests,
} from "../controllers/friendController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware); // bütün route'lar için

router.post("/request", sendFriendRequest);
router.post("/accept", acceptFriendRequest);
router.get("/", getFriends);
router.get("/requests", getPendingRequests);

export default router;
