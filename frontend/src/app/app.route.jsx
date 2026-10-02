import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import Clue from "../features/clue/Clue.jsx";
import Entercode from "../features/entercode/Entercode.jsx";
import Level from "../features/level/Level.jsx";
import Login from "../features/auth/Login.jsx";
import Question from "../features/questionot/Question.jsx";
import Register from "../features/auth/Register.jsx";

function RequireAuth() {
  let isAuthenticated = false;

  try {
    const session = JSON.parse(localStorage.getItem("hintgame.session") || "null");
    isAuthenticated = typeof session?.token === "string" && session.token.length > 0;
  } catch {
    isAuthenticated = false;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<RequireAuth />}>
        <Route path="/levels" element={<Level />} />
        <Route path="/question" element={<Question />} />
        <Route path="/clue" element={<Clue />} />
        <Route path="/code" element={<Entercode />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default AppRoutes;