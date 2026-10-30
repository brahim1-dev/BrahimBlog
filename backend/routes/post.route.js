import { Router } from "express";
import { createPost, deletePost, getAllPosts, getPostById, getUserPosts, updatePost  } from "../controllers/post.controller.js";
import {protectRoute} from "../middlewares/protectRoute.js"

const router = Router()

router.get("/", getAllPosts);
router.get("/:id", getPostById);
router.get("/user/:username", getUserPosts);
router.post("/create", protectRoute, createPost);
router.put("/:id", protectRoute, updatePost);
router.delete("/:id", protectRoute, deletePost);

export default router;
