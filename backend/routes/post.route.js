import { Router } from "express";
import { createPost, deletePost, getAllPosts, getPostById, getUserPosts, updatePost  } from "../controllers/post.controller";


const router = Router()

router.get("/", getAllPosts);
router.get("/:id", getPostById);
router.get("/user/:username", getUserPosts);
router.get("/create", createPost);
router.get("/:id", updatePost);
router.get("/:id", deletePost);

export default router;