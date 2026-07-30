"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(""); setMessage(""); setSubmitting(true);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("http://localhost:5000/api/auth/signup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: form.get("name"), email: form.get("email"), password: form.get("password") }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      localStorage.setItem("franchiseops_token", data.token);
      localStorage.setItem("franchiseops_user", JSON.stringify(data.user));
      router.replace("/");
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Unable to create your account."); }
    finally { setSubmitting(false); }
  }

  return (
    <main className="auth-shell">
      <section className="auth-panel auth-brand-panel">
        <Link href="/" className="auth-brand"><span>▣</span> FranchiseOps <small>AI Intelligence</small></Link>
        <div><p className="auth-eyebrow">Get started</p><h1>One command center for your franchise.</h1><p className="auth-copy">Bring outlet performance and inventory decisions together from day one.</p></div>
        <p className="auth-footnote">Secure, role-aware operational access</p>
      </section>
      <section className="auth-form-panel">
        <div className="auth-card">
          <p className="auth-eyebrow">Create your workspace</p><h2>Set up your account</h2><p className="auth-muted">Start managing your franchise operations in minutes.</p>
          <form onSubmit={handleSubmit} className="auth-form">
            <label>Full name<input type="text" name="name" placeholder="Your name" required /></label>
            <label>Work email<input type="email" name="email" placeholder="you@company.com" required /></label>
            <label>Password<input type="password" name="password" placeholder="At least 6 characters" minLength={6} required /></label>
            <label className="auth-check"><input type="checkbox" required /> I agree to the Terms of Service and Privacy Policy.</label>
            <button type="submit" className="auth-primary" disabled={submitting}>{submitting ? "Creating account..." : "Create account"}</button>
            {message && <p className="auth-success" role="status">{message}</p>}
            {error && <p className="auth-error" role="alert">{error}</p>}
          </form>
          <p className="auth-switch">Already have an account? <Link href="/login">Sign in</Link></p>
        </div>
      </section>
    </main>
  );
}
