import { Router } from "express"
import { deleteUser, getUsers, updateUserRole, updateUserStatus } from "../controllers/admin.controller.js"
import { getAdminPostById, getAdminPosts, setPostPublished } from "../controllers/post.controller.js"
import { protectRoute } from "../middlewares/protectRoute.js"
import { requireAdmin } from "../middlewares/requireAdmin.js"

const router = Router()

router.use(protectRoute, requireAdmin)
router.get("/users", getUsers)
router.patch("/users/:userId/role", updateUserRole)
router.patch("/users/:userId/status", updateUserStatus)
router.delete("/users/:userId", deleteUser)
router.get("/posts", getAdminPosts)
router.get("/posts/:postId", getAdminPostById)
router.patch("/posts/:postId/status", setPostPublished)

export default router