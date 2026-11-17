import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useStore } from "../context/StoreContext";

export default function Auth({ register = false }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const { setUser } = useStore();
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");

    try {
      const d = await api(`/auth/${register ? "register" : "login"}`, {
        method: "POST",
        body: JSON.stringify(form),
      });

      localStorage.setItem("calzare_token", d.token);
      setUser(d.user);

      // Send admins and superadmins to the Admin Dashboard
      const destination = ["admin", "superadmin"].includes(d.user?.role)
        ? "/admin"
        : "/account";

      nav(destination, { replace: true });
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth-wrap">
      <form className="auth-card" onSubmit={submit}>
        <p className="eyebrow">WELCOME TO CALZARE</p>
        <h1>{register ? "Create an account" : "Sign in"}</h1>
        <p>
          {register
            ? "A better way to keep your favourites close."
            : "Good to have you back."}
        </p>

        {register && (
          <input
            required
            placeholder="Full name"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />
        )}

        <input
          required
          type="email"
          placeholder="Email address"
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        <input
          required
          minLength="8"
          type="password"
          placeholder="Password (at least 8 characters)"
          value={form.password}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />

        {error && <p className="error">{error}</p>}

        <button className="btn btn-dark full" disabled={busy}>
          {busy
            ? "PLEASE WAIT…"
            : register
            ? "CREATE ACCOUNT"
            : "SIGN IN"}
        </button>

        <p className="auth-switch">
          {register
            ? "Already have an account?"
            : "New to Calzare?"}{" "}
          <Link to={register ? "/login" : "/register"}>
            {register ? "Sign in" : "Create an account"}
          </Link>
        </p>
      </form>
    </main>
  );
}
