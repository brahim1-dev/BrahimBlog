import { Router } from "express"
import { deleteUser, getUsers, updateUserRole } from "../controllers/admin.controller.js"
import { getAllPosts } from "../controllers/post.controller.js"
import { protectRoute } from "../middlewares/protectRoute.js"
import { requireAdmin } from "../middlewares/requireAdmin.js"

const router = Router()

router.use(protectRoute, requireAdmin)
router.get("/users", getUsers)
router.patch("/users/:userId/role", updateUserRole)
router.delete("/users/:userId", deleteUser)
router.get("/posts", getAllPosts)

export default router