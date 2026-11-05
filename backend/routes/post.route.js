import { Router } from "express";
import { createPost, deletePost, getAllPosts, getPostById, getUserPosts, updatePost  } from "../controllers/post.controller.js";
import { protectRoute, rejectDisabledSession } from "../middlewares/protectRoute.js"

const router = Router()

router.get("/", rejectDisabledSession, getAllPosts);
router.get("/:id", rejectDisabledSession, getPostById);
router.get("/user/:username", rejectDisabledSession, getUserPosts);
router.post("/create", protectRoute, createPost);
router.put("/:id", protectRoute, updatePost);
router.delete("/:id", protectRoute, deletePost);

export default router;
