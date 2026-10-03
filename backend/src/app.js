import express from "express";
import cors from "cors";
import teamRoutes from "./routes/user.routes.js";
import questionRoutes from "./routes/question.routes.js";

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use("/api/teams", teamRoutes);
app.use("/api/questions", questionRoutes);

export default app;