"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { API_BASE } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Redirect already-authenticated visitors before rendering the form so
  // they never see a flash of the login UI.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/me`, { credentials: "include" });
        if (!cancelled && res.ok) {
          router.replace("/activity");
          return;
        }
      } catch {
        // Network error — just show the form.
      }
      if (!cancelled) setCheckingAuth(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (checkingAuth) return null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus(data.error || "Login failed");
        return;
      }
      router.push("/dashboard");
    } catch {
      setStatus("Network error — please try again");
    } finally {
      setLoading(false);
    }
  }

  const invalid = Boolean(status);

  return (
    <main className="auth">
      <h1>Log in</h1>
      <form onSubmit={onSubmit} noValidate>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={invalid}
            aria-describedby={invalid ? "form-status" : undefined}
          />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={invalid}
            aria-describedby={invalid ? "form-status" : undefined}
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Logging in…" : "Log in"}
        </button>
        <div id="form-status" className={`status${status ? " error" : ""}`}>
          {status}
        </div>
      </form>
      <p className="muted">
        No account? <Link href="/signup">Sign up</Link>
      </p>
    </main>
  );
}
