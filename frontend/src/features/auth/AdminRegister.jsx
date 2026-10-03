import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const serverUrl = (
  import.meta.env.VITE_SERVER_URL || "http://localhost:3000"
).replace(/\/$/, "");

function AdminRegister() {
  const navigate = useNavigate();
  const [teamName, setTeamName] = useState("");
  const [teamCode, setTeamCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch(`${serverUrl}/api/teams/admin/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamName: teamName.trim(),
          teamCode: teamCode.trim().toUpperCase(),
          password,
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not create the admin account.");
      }

      navigate("/admin/login", {
        replace: true,
        state: { notice: result.message },
      });
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
      <section className="login-panel" aria-labelledby="admin-register-title">
        <div className="brand-mark" aria-hidden="true">H</div>
        <p className="eyebrow">HINTGAME / FIRST ADMIN SETUP</p>
        <h1 id="admin-register-title">Create admin account</h1>
        <p className="panel-copy">
          Create the first and only admin account with your name, team code, and
          password.
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="admin-team-name">Admin name</label>
          <input
            id="admin-team-name"
            type="text"
            autoComplete="name"
            value={teamName}
            onChange={(event) => setTeamName(event.target.value)}
            required
            disabled={isSubmitting}
          />

          <label htmlFor="admin-register-code">Admin team code</label>
          <input
            id="admin-register-code"
            type="text"
            autoComplete="username"
            autoCapitalize="characters"
            value={teamCode}
            onChange={(event) => setTeamCode(event.target.value.toUpperCase())}
            required
            disabled={isSubmitting}
          />

          <label htmlFor="admin-register-password">Password</label>
          <input
            id="admin-register-password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            disabled={isSubmitting}
          />

          {error && <p className="login-error" role="alert">{error}</p>}

          <button className="submit-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Create admin account"}
            <span aria-hidden="true">→</span>
          </button>
        </form>

        <p className="auth-switch">
          Already set up? <Link to="/admin/login">Admin sign in</Link>
        </p>
      </section>
    </main>
  );
}

export default AdminRegister;
