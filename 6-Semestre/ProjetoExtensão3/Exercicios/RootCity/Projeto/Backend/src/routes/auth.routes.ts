import { Router } from "express";
import { cadastrar, login, logout, me } from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", cadastrar);
router.post("/login", login);
router.get("/me", me);
router.post("/logout", logout);

export default router;