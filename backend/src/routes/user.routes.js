import { Router } from "express";
import { loginTeam, registerAdmin, registerTeam } from "../controller/auth.controller.js";

const router = Router();

router.post("/register", registerTeam);
router.post("/login", loginTeam);
router.post("/admin/register", registerAdmin);



export default router;
