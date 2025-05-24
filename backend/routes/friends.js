import express from "express";
import {
  sendFriendRequest,
  acceptFriendRequest,
  getFriends,
} from "../controllers/friendController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware); // bütün route'lar için

router.post("/request", sendFriendRequest);
router.post("/accept", acceptFriendRequest);
router.get("/", getFriends);

export default router;
