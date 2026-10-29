import { Router } from "express";
import { register, test } from "../controllers/auth.controller.js";


const router = Router();

router.get("/test", test)
router.post("/register", register)


export default router;