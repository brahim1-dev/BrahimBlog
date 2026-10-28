import { Router } from "express";
import { test } from "../controllers/auth.controller.js";
const router = Router();

router.get("/test", test)


export default router;