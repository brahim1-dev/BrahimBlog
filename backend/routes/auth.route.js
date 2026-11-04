import { Router } from "express";
import {
	changePassword,
	deleteAccount,
	getMe,
	login,
	logout,
	register,
	test,
	updateProfile,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middlewares/protectRoute.js";


const router = Router();

router.get("/test", test)
router.post("/register", register)
router.post("/login", login)
router.post("/logout", logout)
router.get("/me", protectRoute, getMe)
router.patch("/profile", protectRoute, updateProfile)
router.put("/password", protectRoute, changePassword)
router.delete("/account", protectRoute, deleteAccount)


export default router;