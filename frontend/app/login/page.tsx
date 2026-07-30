"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(""); setMessage(""); setSubmitting(true);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: form.get("email"), password: form.get("password") }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      localStorage.setItem("franchiseops_token", data.token);
      localStorage.setItem("franchiseops_user", JSON.stringify(data.user));
      router.replace("/");
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Unable to sign in."); }
    finally { setSubmitting(false); }
  }

  return (
    <main className="auth-shell">
      <section className="auth-panel auth-brand-panel">
        <Link href="/" className="auth-brand"><span>▣</span> FranchiseOps <small>AI Intelligence</small></Link>
        <div><p className="auth-eyebrow">Operations intelligence</p><h1>Run every outlet with clarity.</h1><p className="auth-copy">Track inventory, sales, teams, and recommendations in one operational workspace.</p></div>
        <p className="auth-footnote">© 2026 FranchiseOps AI</p>
      </section>
      <section className="auth-form-panel">
        <div className="auth-card">
          <p className="auth-eyebrow">Welcome back</p><h2>Sign in to FranchiseOps</h2><p className="auth-muted">Enter your account details to access your dashboard.</p>
          <form onSubmit={handleSubmit} className="auth-form">
            <label>Work email<input type="email" name="email" placeholder="you@company.com" required /></label>
            <label>Password<input type="password" name="password" placeholder="Enter your password" minLength={6} required /></label>
            <div className="auth-row"><label className="auth-check"><input type="checkbox" /> Remember me</label><a href="#">Forgot password?</a></div>
            <button type="submit" className="auth-primary" disabled={submitting}>{submitting ? "Signing in..." : "Sign in"}</button>
            {message && <p className="auth-success" role="status">{message}</p>}
            {error && <p className="auth-error" role="alert">{error}</p>}
          </form>
          <p className="auth-switch">New to FranchiseOps? <Link href="/signup">Create an account</Link></p>
        </div>
      </section>
    </main>
  );
}
