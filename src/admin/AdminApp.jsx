import { useEffect, useState } from "react";
import { getClient } from "../lib/data";
import Editor from "./Editor.jsx";

function SetupNeeded() {
  return (
    <main className="center">
      <div className="panel">
        <h1>Connect your database first</h1>
        <p>This page can't save anything yet because <code>src/config.js</code> still has placeholder Supabase values.</p>
        <p>Paste your Supabase project URL and key into it (or into Vercel's Environment Variables), then build and deploy again.</p>
        <p>Using XAMPP on your computer? Open this page through Apache instead, for example <code>http://localhost/portfolio/admin/</code>.</p>
        <a className="link" href="../">Back to the website</a>
      </div>
    </main>
  );
}

function BackendProblem({ kind, message }) {
  if (kind === "netlify") {
    return (
      <main className="center">
        <div className="panel">
          <h1>The Netlify backend isn't ready</h1>
          <p className="form-error">{message}</p>
          <ol className="steps-list">
            <li>Make sure the site was deployed from <b>GitHub</b> (Netlify → Add new site → Import an existing project), so its functions are included.</li>
            <li>In Netlify, check <b>Project configuration → Environment variables</b> has <b>ADMIN_EMAIL</b> and <b>ADMIN_PASSWORD</b>.</li>
            <li>After changing them, go to <b>Deploys → Trigger deploy</b>, then reload this page.</li>
          </ol>
          <a className="link" href="../">Back to the website</a>
        </div>
      </main>
    );
  }
  return (
    <main className="center">
      <div className="panel">
        <h1>The XAMPP backend isn't ready</h1>
        <p className="form-error">{message}</p>
        <ol className="steps-list">
          <li>Open the <b>XAMPP Control Panel</b> and start <b>Apache</b> and <b>MySQL</b>.</li>
          <li>Open <a className="link" href="../server/setup.php">server/setup.php</a> once to create the database and your admin account.</li>
          <li>Come back to this page and reload it.</li>
        </ol>
        <a className="link" href="../">Back to the website</a>
      </div>
    </main>
  );
}

function Login({ db, onSignedIn }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    const { data, error: err } = await db.auth.signInWithPassword({ email: f.get("email"), password: f.get("password") });
    setBusy(false);
    if (err) {
      setError(/invalid/i.test(err.message) ? "That email and password don't match. Check both and try again." : err.message);
      return;
    }
    onSignedIn(data.session);
  }

  return (
    <main className="center">
      <form className="panel" id="loginForm" onSubmit={submit}>
        <span className="badge-mark">YM</span>
        <h1>Sign in to edit your portfolio</h1>
        <label>
          Email
          <input type="email" name="email" autoComplete="username" required />
        </label>
        <label>
          Password
          <input type="password" name="password" autoComplete="current-password" required />
        </label>
        {error && <p className="form-error" id="loginError" role="alert">{error}</p>}
        <button className="btn btn-solid" type="submit" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
        <a className="link small" href="../">Back to the website</a>
      </form>
    </main>
  );
}

export default function AdminApp() {
  const [state, setState] = useState({ phase: "loading" });

  useEffect(() => {
    (async () => {
      const db = await getClient();
      if (!db) return setState({ phase: "setup" });
      const { data, error } = await db.auth.getSession();
      if (error && db.kind) return setState({ phase: "backend", kind: db.kind, message: error.message });
      if (db.kind) {
        const r = await db.from("profile").select("*").eq("id", 1).maybeSingle();
        if (r.error) return setState({ phase: "backend", kind: db.kind, message: r.error.message });
      }
      setState(data.session ? { phase: "app", db, session: data.session } : { phase: "login", db });
    })();
  }, []);

  if (state.phase === "loading") return null;
  if (state.phase === "setup") return <SetupNeeded />;
  if (state.phase === "backend") return <BackendProblem kind={state.kind} message={state.message} />;
  if (state.phase === "login") {
    return <Login db={state.db} onSignedIn={(session) => setState({ phase: "app", db: state.db, session })} />;
  }
  return (
    <Editor
      db={state.db}
      session={state.session}
      onSignOut={async () => {
        await state.db.auth.signOut();
        setState({ phase: "login", db: state.db });
      }}
    />
  );
}
