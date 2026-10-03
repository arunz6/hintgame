import { Router } from "express";
import { addTeamQuestions } from "../controller/questions.controller.js";
import { requireAdmin, requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", requireAuth, requireAdmin, addTeamQuestions);

export default router;