import { Router } from "express";
import { login, register, test } from "../controllers/auth.controller.js";


const router = Router();

router.get("/test", test)
router.post("/register", register)
router.post("/login", login)


export default router;