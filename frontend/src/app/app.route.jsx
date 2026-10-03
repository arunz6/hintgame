import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import Clue from "../features/clue/Clue.jsx";
import Entercode from "../features/entercode/Entercode.jsx";
import Level from "../features/level/Level.jsx";
import Login from "../features/auth/Login.jsx";
import Question from "../features/questionot/Question.jsx";
import Register from "../features/auth/Register.jsx";
import AddQuestions from "../features/addquestions/addquestions.jsx";
import AdminLogin from "../features/auth/AdminLogin.jsx";
import AdminRegister from "../features/auth/AdminRegister.jsx";

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

function RequireAdmin() {
  let role = null;
  try {
    const session = JSON.parse(localStorage.getItem("hintgame.session") || "null");
    role = session?.team?.role;
  } catch {
    role = null;
  }

  if (role === "admin") return <Outlet />;
  return role ? <Navigate to="/levels" replace /> : <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/register" element={<AdminRegister />} />
      <Route element={<RequireAuth />}>
        <Route path="/levels" element={<Level />} />
        <Route path="/question" element={<Question />} />
        <Route path="/clue" element={<Clue />} />
        <Route path="/code" element={<Entercode />} />
      </Route>
      <Route element={<RequireAuth />}>
        <Route element={<RequireAdmin />}>
          <Route path="/admin/questions" element={<AddQuestions />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default AppRoutes;