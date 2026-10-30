import { Router } from "express";
import { createPost, deletePost, getAllPosts, getPostById, getUserPosts, updatePost  } from "../controllers/post.controller";
import {protectRoute} from "../middlewares/protectRoute.js"

const router = Router()

router.get("/", getAllPosts);
router.get("/:id", getPostById);
router.get("/user/:username", getUserPosts);
router.get("/create",protectRoute, createPost);
router.get("/:id",protectRoute, updatePost);
router.get("/:id",protectRoute, deletePost);

export default router;