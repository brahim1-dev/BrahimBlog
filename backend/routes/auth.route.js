import { Router } from "express";
import { login, logout, register, test } from "../controllers/auth.controller.js";


const router = Router();

router.get("/test", test)
router.post("/register", register)
router.post("/login", login)
router.post("/logout", logout)


export default router;