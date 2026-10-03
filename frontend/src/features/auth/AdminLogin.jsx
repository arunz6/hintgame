import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const serverUrl = (
  import.meta.env.VITE_SERVER_URL || "http://localhost:3000"
).replace(/\/$/, "");

function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [teamCode, setTeamCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch(`${serverUrl}/api/teams/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamCode: teamCode.trim().toUpperCase(),
          password,
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not sign in.");
      }
      if (result.team?.role !== "admin" || typeof result.token !== "string") {
        throw new Error("This account does not have admin access.");
      }

      localStorage.setItem("hintgame.session", JSON.stringify(result));
      navigate("/admin/questions", { replace: true });
    } catch (requestError) {
      setError(
        requestError instanceof TypeError
          ? "Can't reach the server. Check your connection and try again."
          : requestError.message,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-panel" aria-labelledby="admin-login-title">
        <div className="brand-mark" aria-hidden="true">H</div>
        <p className="eyebrow">HINTGAME / ADMIN</p>
        <h1 id="admin-login-title">Admin sign in</h1>
        <p className="panel-copy">Sign in to manage team questions.</p>
        {location.state?.notice && (
          <p className="mb-4 text-sm text-green-300" role="status">
            {location.state.notice}
          </p>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="admin-team-code">Admin team code</label>
          <input
            id="admin-team-code"
            type="text"
            autoComplete="username"
            autoCapitalize="characters"
            value={teamCode}
            onChange={(event) => setTeamCode(event.target.value.toUpperCase())}
            required
            disabled={isSubmitting}
          />

          <label htmlFor="admin-password">Password</label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            disabled={isSubmitting}
          />

          {error && <p className="login-error" role="alert">{error}</p>}

          <button className="submit-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Admin sign in"}
            <span aria-hidden="true">→</span>
          </button>
        </form>

        <p className="auth-switch">
          Need the first admin account? <Link to="/admin/register">Set it up</Link>
        </p>
      </section>
    </main>
  );
}

export default AdminLogin;
