"use client";

import "../login.css";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "../../lib/supabase/browser";

type DemoRole = "ambulance" | "police";

const DEMOS: Array<{ role: DemoRole; title: string; label: string; detail: string; href: string }> = [
  { role: "ambulance", title: "Ambulance operator", label: "DEMO · AMBULANCE", detail: "Practice an emergency trip and GPS sharing.", href: "/ambulance?mode=demo&role=ambulance" },
  { role: "police", title: "Traffic police officer", label: "DEMO · POLICE", detail: "Practice receiving and acknowledging an alert.", href: "/police-live?mode=demo&role=police" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const useDemo = (role: DemoRole, href: string) => {
    localStorage.setItem("neram_demo_role", role);
    localStorage.setItem("neram_access_mode", "demo");
    router.push(href);
  };

  const signIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      const supabase = getSupabaseBrowserClient();
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;

      const userId = authData.user?.id;
      if (!userId) throw new Error("No authenticated user was returned.");

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", userId)
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profile) {
        await supabase.auth.signOut();
        throw new Error("This account is authenticated but has no Neram operator profile yet.");
      }

      localStorage.removeItem("neram_demo_role");
      localStorage.setItem("neram_access_mode", "verified");
      localStorage.setItem("neram_role", profile.role);
      localStorage.setItem("neram_name", profile.full_name ?? "");

      router.push(profile.role === "ambulance" ? "/ambulance" : profile.role === "police" ? "/police-live" : "/dashboard");
    } catch (signInError) {
      setError(signInError instanceof Error ? signInError.message : "Unable to sign in.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="neram-login">
      <div className="neram-login-orbit" aria-hidden="true" />
      <header className="neram-login-header">
        <a href="/" className="neram-login-brand" aria-label="Neram home"><span>N</span><b>Neram</b></a>
        <span className="neram-login-location">CHENNAI · OPERATOR ACCESS</span>
      </header>

      <section className="neram-login-grid">
        <div className="neram-login-intro">
          <div className="neram-login-kicker"><i /> NERAM OPERATIONS</div>
          <h1>Give the right person <em>the right signal.</em></h1>
          <p>Sign in to an authorised Neram account, or enter a controlled demo to exercise the emergency-response workflow.</p>
          <div className="neram-login-rule"><span /><b>AUTHENTICATED ACCESS</b><span /></div>
          <div className="neram-login-principles">
            <span><b>01</b><strong>Verified roles</strong><small>Ambulance, police and admin access are provisioned server-side.</small></span>
            <span><b>02</b><strong>Human control</strong><small>Neram informs the officer; it never changes the signal.</small></span>
          </div>
        </div>

        <div className="neram-login-panel">
          <div className="neram-login-panel-head">
            <div><small>VERIFIED ACCOUNT</small><h2>Operator sign in</h2></div>
            <span className="neram-login-secure"><i /> SECURE</span>
          </div>

          <form onSubmit={signIn} className="neram-login-form">
            <label>Email<input type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="operator@yourorg.in" required /></label>
            <label>Password<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Your password" required /></label>
            {error && <p className="neram-login-error" role="alert">{error}</p>}
            <button type="submit" disabled={busy}>{busy ? "Signing in…" : "Sign in"}<span>→</span></button>
          </form>

          <div className="neram-login-divider"><span /> OR <span /></div>

          <div className="neram-login-demos">
            <div className="neram-login-demos-head"><small>CONTROLLED TRAINING</small><span>NO REAL POLICE ACCESS</span></div>
            {DEMOS.map((demo) => <button key={demo.role} type="button" onClick={() => useDemo(demo.role, demo.href)} className="neram-demo-card"><span className={`neram-demo-icon ${demo.role}`}><i /></span><span><b>{demo.label}</b><strong>{demo.title}</strong><small>{demo.detail}</small></span><span className="neram-demo-arrow">↗</span></button>)}
          </div>

          <p className="neram-login-footnote">Production roles are assigned to verified accounts. Demo access stays explicitly separated from operational access.</p>
        </div>
      </section>
    </main>
  );
}
