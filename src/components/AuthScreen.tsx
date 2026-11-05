"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Eye, EyeOff, GitBranch, Heart, Leaf, LockKeyhole, Mail, UserRound } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";

type AuthMode = "login" | "register";

function getSafeReturnTo(requestedPath: string | null) {
  if (!requestedPath?.startsWith("/") || requestedPath.startsWith("//") || requestedPath.includes("\\") || /[\u0000-\u001f]/.test(requestedPath)) {
    return "/";
  }
  try {
    const url = new URL(requestedPath, window.location.origin);
    return url.origin === window.location.origin ? `${url.pathname}${url.search}${url.hash}` : "/";
  } catch {
    return "/";
  }
}

export function AuthScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const { login, register, loginWithGitHub, isAuthenticated } = useAuth();
  const mode: AuthMode = pathname === "/register" ? "register" : "login";
  const [form, setForm] = useState({ name: "", email: "", password: "", photoUrl: "" });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [githubEnabled, setGithubEnabled] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/auth/providers", { credentials: "same-origin" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to check OAuth provider configuration.");
        return response.json() as Promise<{ github: boolean }>;
      })
      .then(({ github }) => {
        if (active) setGithubEnabled(github);
      })
      .catch((providerError: unknown) => {
        console.error("Unable to check OAuth provider configuration:", providerError);
      });
    return () => {
      active = false;
    };
  }, []);

  const getRedirectPath = () => {
    const requestedPath = new URLSearchParams(window.location.search).get("returnTo");
    return getSafeReturnTo(requestedPath);
  };

  const redirectAfterLogin = () => {
    router.push(getRedirectPath());
  };

  const changeMode = (nextMode: AuthMode) => {
    setError("");
    const requestedPath = new URLSearchParams(window.location.search).get("returnTo");
    const safeReturnTo = getSafeReturnTo(requestedPath);
    const returnTo = safeReturnTo !== "/" ? `?returnTo=${encodeURIComponent(safeReturnTo)}` : "";
    router.push(`${nextMode === "register" ? "/register" : "/login"}${returnTo}`);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (mode === "register") {
      if (form.name.trim().length < 2) {
        setError("Please enter your name (between 2 and 80 characters).");
        return;
      }
      if (form.name.trim().length > 80) {
        setError("Please enter your name (between 2 and 80 characters).");
        return;
      }
      if (form.password.length < 6 || !/[A-Z]/.test(form.password) || !/[a-z]/.test(form.password)) {
        setError("Use at least 6 characters, including an uppercase and a lowercase letter.");
        return;
      }
      if (form.photoUrl.trim()) {
        try {
          const imageUrl = new URL(form.photoUrl);
          if (!["http:", "https:"].includes(imageUrl.protocol)) throw new Error();
        } catch {
          setError("Enter a valid photo URL, or leave this optional field blank.");
          return;
        }
      }
    }

    setBusy(true);
    try {
      if (mode === "register") {
        await register({ name: form.name.trim(), email: form.email.trim(), password: form.password, photoUrl: form.photoUrl.trim() || undefined });
        toast.success("Welcome to the community. Let’s do some good.");
      } else {
        await login({ email: form.email.trim(), password: form.password });
        toast.success("Welcome back. It’s good to have you here.");
      }
      redirectAfterLogin();
    } catch (authError) {
      const message = authError instanceof Error ? authError.message : "We couldn’t sign you in. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  const handleGitHubSignIn = async () => {
    setError("");
    setBusy(true);
    try {
      await loginWithGitHub(`${window.location.origin}${getRedirectPath()}`);
    } catch (authError) {
      const message = authError instanceof Error ? authError.message : "GitHub sign-in is unavailable.";
      setError(message);
      toast.error(message);
      setBusy(false);
    }
  };

  if (isAuthenticated) {
    return (
      <main className="cc-auth-page">
        <div className="cc-auth-visual">
          <img src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1400&q=85" alt="" />
          <div className="cc-auth-visual-copy">
            <Link href="/" className="cc-brand"><span className="cc-brand-mark"><Leaf size={21} /></span><span className="cc-brand-name">community<span>connect</span></span></Link>
            <h1>Good to have<br />you with us.</h1>
          </div>
        </div>
        <div className="cc-auth-form-side">
          <div className="cc-auth-box">
            <div className="cc-auth-top"><span className="cc-eyebrow">Already part of the good</span><h2>You’re signed in.</h2><p>Keep discovering ways to make an impact in your neighborhood.</p></div>
            <Link href="/" className="cc-button">Back to home <Heart size={16} /></Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="cc-auth-page">
      <aside className="cc-auth-visual">
        <img
          src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1400&q=90"
          alt="Volunteers working together in their community"
          fetchPriority="high"
        />
        <div className="cc-auth-visual-copy">
          <Link href="/" className="cc-brand">
            <span className="cc-brand-mark"><Leaf size={21} /></span>
            <span className="cc-brand-name">community<span>connect</span></span>
          </Link>
          <h1>There’s a place<br />for you here.</h1>
          <p>Every community is built by people who care enough to show up. Find your people, and find your way to make a difference.</p>
        </div>
      </aside>
      <section className="cc-auth-form-side">
        <div className="cc-auth-box">
          <div className="cc-auth-top">
            <span className="cc-eyebrow">Small actions add up</span>
            <h2>{mode === "login" ? "Welcome back." : "Come on in."}</h2>
            <p>{mode === "login" ? "Sign in and pick up where your good work left off." : "Create your account and find your first way to help."}</p>
          </div>

          <div className="cc-auth-tabs" role="tablist" aria-label="Authentication">
            <button type="button" className={mode === "login" ? "cc-auth-tab is-active" : "cc-auth-tab"} onClick={() => changeMode("login")} role="tab" aria-selected={mode === "login"}>Log in</button>
            <button type="button" className={mode === "register" ? "cc-auth-tab is-active" : "cc-auth-tab"} onClick={() => changeMode("register")} role="tab" aria-selected={mode === "register"}>Create an account</button>
          </div>

          <form onSubmit={handleSubmit} className="cc-form-grid" noValidate>
            {mode === "register" && (
              <div className="cc-field">
                <label htmlFor="auth-name">Your name</label>
                <div className="cc-field-input"><UserRound size={16} /><input id="auth-name" autoComplete="name" required maxLength={80} value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="How should we call you?" /></div>
              </div>
            )}
            <div className="cc-field">
              <label htmlFor="auth-email">Email address</label>
              <div className="cc-field-input"><Mail size={16} /><input id="auth-email" type="email" autoComplete="email" required value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} placeholder="you@example.com" /></div>
            </div>
            {mode === "register" && (
              <div className="cc-field">
                <label htmlFor="auth-photo">Photo URL <span style={{ color: "var(--subtle)", fontWeight: 500 }}>· optional</span></label>
                <div className="cc-field-input"><UserRound size={16} /><input id="auth-photo" type="url" maxLength={2048} value={form.photoUrl} onChange={(event) => setForm((current) => ({ ...current, photoUrl: event.target.value }))} placeholder="https://..." /></div>
              </div>
            )}
            <div className="cc-field">
              <label htmlFor="auth-password">Password</label>
              <div className="cc-field-input">
                <LockKeyhole size={16} />
                <input id="auth-password" type={passwordVisible ? "text" : "password"} autoComplete={mode === "login" ? "current-password" : "new-password"} required minLength={6} value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} placeholder={mode === "login" ? "Enter your password" : "At least 6 characters"} style={{ paddingRight: 43 }} />
                <button type="button" className="cc-password-toggle" onClick={() => setPasswordVisible((visible) => !visible)} aria-label={passwordVisible ? "Hide password" : "Show password"}>
                  {passwordVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {mode === "register" && <span style={{ display: "block", marginTop: 6, color: "var(--subtle)", fontSize: 9 }}>Include at least one uppercase and one lowercase letter.</span>}
            </div>
            {error && <span className="cc-form-error" role="alert">{error}</span>}
            <button type="submit" className="cc-button cc-form-submit" disabled={busy}>
              {busy ? "One moment…" : mode === "login" ? "Log in to your account" : "Create my account"}
              {!busy && <Heart size={15} />}
            </button>
          </form>

          {githubEnabled && (
            <>
              <div className="cc-auth-divider">or continue with</div>
              <button type="button" onClick={handleGitHubSignIn} className="cc-github-button" disabled={busy}><GitBranch size={16} /> Continue with GitHub</button>
            </>
          )}
          <p className="cc-auth-terms">
            {mode === "login" ? (
              <>New to Community Connect? <Link href="/register">Create an account</Link>.</>
            ) : (
              <>Already a member? <Link href="/login">Log in</Link>.</>
            )}
          </p>
          <p className="cc-auth-terms">
            By joining, you agree to be kind, show up as you are, and help make your community a little better.
          </p>
        </div>
      </section>
    </main>
  );
}
