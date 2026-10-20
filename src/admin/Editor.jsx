import { useCallback, useEffect, useRef, useState } from "react";
import { seed } from "../lib/data";
import { SECTION_KEYS, getSections } from "../lib/sections";
import { assetUrl } from "../lib/utils";
import Modal from "../components/Modal.jsx";
import { COLLECTIONS, COLLECTION_KEYS, PROFILE_FIELDS } from "./schema";
import { explain } from "./helpers";
import { Fields, collectValues, useFieldsForm } from "./fields.jsx";

const HIDE_KEY = "pf-seed-hidden";

function useToast() {
  const [toast, setToast] = useState(null);
  const timer = useRef();
  const show = useCallback((msg, isError = false) => {
    setToast({ msg, isError });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), isError ? 6000 : 2800);
  }, []);
  const node = toast && (
    <div className={`toast${toast.isError ? " is-error" : ""}`} id="toast" role="status" aria-live="polite">{toast.msg}</div>
  );
  return [show, node];
}

function SeedBanner({ profile, rows, onFill, onHide, busy }) {
  const empty = COLLECTION_KEYS.filter((t) => !(rows[t] || []).length && (seed()[t] || []).length);
  const signature = (profile ? "" : "profile,") + empty.join(",");
  let hidden = "";
  try { hidden = localStorage.getItem(HIDE_KEY) || ""; } catch { }
  if (!signature || hidden === signature) return null;

  const allEmpty = !profile && empty.length === COLLECTION_KEYS.length;
  const names = [...(profile ? [] : ["Profile"]), ...empty.map((t) => COLLECTIONS[t].label)];

  return (
    <div className="seed-banner" id="seedBanner">
      <div>
        <strong>
          {allEmpty
            ? "Your database is empty."
            : `${names.length === 1 ? "This section is" : "These sections are"} empty: ${names.join(", ")}.`}
        </strong>
        <p>
          {allEmpty
            ? "Copy the starting content (your experience, certificates, skills and more) into it so you can edit everything here."
            : "Fill them with your starting content. Anything you've already added or edited stays as it is."}
        </p>
      </div>
      <div className="seed-actions">
        <button className="btn btn-solid" id="seedBtn" type="button" disabled={busy} onClick={() => onFill(empty)}>
          {busy ? "Loading…" : allEmpty ? "Load my starting content" : "Fill empty sections"}
        </button>
        {!allEmpty && (
          <button className="link small" type="button" onClick={() => onHide(signature)}>Hide this</button>
        )}
      </div>
    </div>
  );
}

function ProfileView({ db, profile, onSaved, toast }) {
  const form = useFieldsForm(PROFILE_FIELDS, profile || seed().profile);
  const [busy, setBusy] = useState(false);

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const values = await collectValues(db, PROFILE_FIELDS, form.values, form.files);
      const { data, error } = await db.from("profile").upsert({ id: 1, ...values, updated_at: new Date().toISOString() }).select().single();
      if (error) throw error;
      onSaved(data);
      toast("Profile saved.");
    } catch (err) {
      toast(explain(err), true);
    }
    setBusy(false);
  }

  return (
    <form className="card" id="profileForm" onSubmit={save}>
      <div className="fields"><Fields fields={PROFILE_FIELDS} form={form} /></div>
      <div className="form-foot">
        <button className="btn btn-solid" type="submit" disabled={busy}>{busy ? "Saving…" : "Save profile"}</button>
      </div>
    </form>
  );
}

function SectionsView({ db, profile, onSaved, toast }) {
  const [values, setValues] = useState(() => getSections(profile));
  const [busy, setBusy] = useState(false);
  const set = (k, field, v) => setValues((p) => ({ ...p, [k]: { ...p[k], [field]: v } }));

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    const sections = {};
    SECTION_KEYS.forEach((k) => {
      sections[k] = { title: values[k].title.trim(), note: (values[k].note || "").trim(), visible: values[k].visible !== false };
    });
    try {
      const base = profile || seed().profile;
      const { data, error } = await db.from("profile").upsert({ ...base, id: 1, sections, updated_at: new Date().toISOString() }).select().single();
      if (error) throw error;
      onSaved(data);
      toast("Sections saved.");
    } catch (err) {
      toast(explain(err), true);
    }
    setBusy(false);
  }

  return (
    <form className="card" id="sectionsForm" onSubmit={save}>
      <div className="section-rows">
        {SECTION_KEYS.map((k) => (
          <fieldset className="section-row" key={k}>
            <legend>{values[k].title || k}</legend>
            <label className="field">
              Title
              <input type="text" name={`${k}__title`} value={values[k].title} required onChange={(e) => set(k, "title", e.target.value)} />
            </label>
            <label className="field">
              Line under the title
              <span className="help">Leave empty for none.</span>
              <input type="text" name={`${k}__note`} value={values[k].note || ""} onChange={(e) => set(k, "note", e.target.value)} />
            </label>
            <label className="check">
              <input type="checkbox" name={`${k}__visible`} checked={values[k].visible !== false} onChange={(e) => set(k, "visible", e.target.checked)} />{" "}
              Show this section on the website
            </label>
          </fieldset>
        ))}
      </div>
      <div className="form-foot">
        <button className="btn btn-solid" type="submit" disabled={busy}>{busy ? "Saving…" : "Save sections"}</button>
      </div>
    </form>
  );
}

function ListView({ table, items, onEdit, onDelete, onMove }) {
  const c = COLLECTIONS[table];
  if (!items.length) {
    return (
      <div className="empty card">
        <p>No {c.label.toLowerCase()} yet. Add your first {c.single} and it appears on the website straight away.</p>
      </div>
    );
  }
  return (
    <ol className="rows">
      {items.map((r, i) => {
        const thumb = c.thumb && c.thumb(r);
        return (
          <li className="row" key={r.id}>
            {c.thumb && (
              <span className={`row-thumb${c.square ? " is-square" : ""}`}>{thumb && <img src={assetUrl(thumb)} alt="" />}</span>
            )}
            <div className="row-text">
              <strong>{c.title(r)}</strong>
              <span className="muted">{c.sub(r) || ""}</span>
            </div>
            <div className="row-actions">
              <button type="button" className="icon" data-act="up" disabled={i === 0} aria-label={`Move ${c.title(r)} up`} onClick={() => onMove(i, i - 1)}>↑</button>
              <button type="button" className="icon" data-act="down" disabled={i === items.length - 1} aria-label={`Move ${c.title(r)} down`} onClick={() => onMove(i, i + 1)}>↓</button>
              <button type="button" className="link" data-act="edit" onClick={() => onEdit(r)}>Edit</button>
              <button type="button" className="link danger" data-act="delete" onClick={() => onDelete(r)}>Delete</button>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function EditorForm({ db, table, row, rows, onDone, onCancel, toast }) {
  const c = COLLECTIONS[table];
  const form = useFieldsForm(c.fields, row || {});
  const [busy, setBusy] = useState(false);
  const categories = [...new Set((rows.skills || []).map((s) => s.category).filter(Boolean))];
  const addLabel = `Add ${c.single}`;

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const values = await collectValues(db, c.fields, form.values, form.files);
      let res;
      if (row) {
        res = await db.from(table).update(values).eq("id", row.id).select().single();
      } else {
        const list = rows[table] || [];
        const minSort = list.length ? Math.min(...list.map((x) => x.sort || 0)) : 10;
        res = await db.from(table).insert({ ...values, sort: minSort - 10 }).select().single();
      }
      if (res.error) throw res.error;
      onDone(res.data, Boolean(row));
      toast(row ? "Changes saved." : `Added "${c.title(res.data)}".`);
    } catch (err) {
      toast(explain(err), true);
      setBusy(false);
    }
  }

  return (
    <form id="editorForm" onSubmit={save}>
      <header className="editor-head">
        <h2>{row ? `Edit ${c.single}` : addLabel}</h2>
        <button className="link" type="button" onClick={onCancel}>Cancel</button>
      </header>
      <div className="editor-fields" id="editorFields">
        <Fields fields={c.fields} form={form} datalistId="categories" />
        <datalist id="categories">{categories.map((x) => <option value={x} key={x} />)}</datalist>
      </div>
      <footer className="editor-foot">
        <button className="btn btn-quiet" type="button" onClick={onCancel}>Cancel</button>
        <button className="btn btn-solid" id="editorSave" type="submit" disabled={busy}>
          {busy ? "Saving…" : row ? "Save changes" : addLabel}
        </button>
      </footer>
    </form>
  );
}

const VIEWS = [
  { key: "profile", label: "Profile", hint: "Your name, introduction, photo and contact details." },
  {
    key: "sections",
    label: "Sections",
    hint: "Rename each part of your website, change the short line under its title, or hide it. The menu at the top uses these titles too."
  },
  ...COLLECTION_KEYS.map((k) => ({ key: k, label: COLLECTIONS[k].label, hint: COLLECTIONS[k].hint }))
];

export default function Editor({ db, session, onSignOut }) {
  const [view, setView] = useState("profile");
  const [profile, setProfile] = useState(null);
  const [rows, setRows] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [editing, setEditing] = useState(null);
  const [seeding, setSeeding] = useState(false);
  const [, forceRender] = useState(0);
  const [toast, toastNode] = useToast();

  const loadAll = useCallback(async () => {
    const p = await db.from("profile").select("*").eq("id", 1).maybeSingle();
    if (p.error) toast(explain(p.error), true);
    const results = await Promise.all(COLLECTION_KEYS.map((t) => db.from(t).select("*").order("sort", { ascending: true })));
    const next = {};
    COLLECTION_KEYS.forEach((t, i) => {
      if (results[i].error) toast(explain(results[i].error), true);
      next[t] = results[i].data || [];
    });
    setProfile(p.data || null);
    setRows(next);
    setLoaded(true);
  }, [db, toast]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  async function fillStartingContent(emptyTables) {
    setSeeding(true);
    const s = seed();
    const failed = [];
    let lastError = null;
    if (!profile) {
      const { error } = await db.from("profile").upsert({ id: 1, ...s.profile });
      if (error) { failed.push("Profile"); lastError = error; }
    }
    for (const t of emptyTables) {
      const items = (s[t] || []).map((r, i) => ({ ...r, sort: (i + 1) * 10 }));
      if (!items.length) continue;
      const res = await db.from(t).insert(items);
      if (res.error) { failed.push(COLLECTIONS[t].label); lastError = res.error; }
    }
    await loadAll();
    setSeeding(false);
    if (failed.length) toast(`Couldn't fill ${failed.join(", ")}: ${explain(lastError)}`, true);
    else toast("Starting content loaded. You can edit everything now.");
  }

  async function remove(table, r) {
    const c = COLLECTIONS[table];
    if (!confirm(`Delete "${c.title(r)}"? This removes it from your website.`)) return;
    const { error } = await db.from(table).delete().eq("id", r.id);
    if (error) return toast(explain(error), true);
    setRows((p) => ({ ...p, [table]: p[table].filter((x) => x.id !== r.id) }));
    toast(`Deleted "${c.title(r)}".`);
  }

  async function move(table, i, j) {
    const list = [...rows[table]];
    if (j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    const before = new Map(rows[table].map((x) => [x.id, x.sort]));
    const renumbered = list.map((x, k) => ({ ...x, sort: (k + 1) * 10 }));
    setRows((p) => ({ ...p, [table]: renumbered }));
    const changed = renumbered.filter((x) => before.get(x.id) !== x.sort);
    const results = [];
    for (const x of changed) results.push(await db.from(table).update({ sort: x.sort }).eq("id", x.id));
    const failed = results.find((x) => x.error);
    if (failed) {
      toast(explain(failed.error), true);
      loadAll();
    }
  }

  function saved(table, data, wasEdit) {
    setRows((p) => ({
      ...p,
      [table]: wasEdit ? p[table].map((x) => (x.id === data.id ? data : x)) : [data, ...(p[table] || [])]
    }));
    setEditing(null);
  }

  const current = VIEWS.find((v) => v.key === view);
  const isList = Boolean(COLLECTIONS[view]);

  return (
    <div className="app" id="appView">
      <aside className="side">
        <div className="side-top">
          <span className="badge-mark">YM</span>
          <div>
            <strong>Portfolio editor</strong>
            <span className="muted small">{session.user.email}</span>
          </div>
        </div>
        <nav className="side-nav" id="sideNav" aria-label="Content">
          {VIEWS.map((v) => (
            <button type="button" key={v.key} data-view={v.key} aria-current={view === v.key ? "page" : "false"} onClick={() => setView(v.key)}>
              {v.label}
              <span className="count">{COLLECTIONS[v.key] ? (rows[v.key] || []).length || "" : ""}</span>
            </button>
          ))}
        </nav>
        <div className="side-bottom">
          <a className="link" href="../" target="_blank" rel="noopener">View website</a>
          <button className="link" id="signOut" type="button" onClick={onSignOut}>Sign out</button>
        </div>
      </aside>

      <main className="main">
        {loaded && (
          <SeedBanner
            profile={profile}
            rows={rows}
            busy={seeding}
            onFill={fillStartingContent}
            onHide={(signature) => {
              try { localStorage.setItem(HIDE_KEY, signature); } catch { }
              forceRender((n) => n + 1);
            }}
          />
        )}
        <header className="main-head">
          <div>
            <h1 id="viewTitle">{current.label}</h1>
            <p className="muted">{current.hint}</p>
          </div>
          {isList && (
            <button className="btn btn-solid" id="addBtn" type="button" onClick={() => setEditing({ table: view, row: null })}>
              Add {COLLECTIONS[view].single}
            </button>
          )}
        </header>

        {loaded && view === "profile" && (
          <ProfileView key={profile ? profile.updated_at || "p" : "seed"} db={db} profile={profile} onSaved={setProfile} toast={toast} />
        )}
        {loaded && view === "sections" && (
          <SectionsView db={db} profile={profile} onSaved={setProfile} toast={toast} />
        )}
        {loaded && isList && (
          <ListView
            table={view}
            items={rows[view] || []}
            onEdit={(r) => setEditing({ table: view, row: r })}
            onDelete={(r) => remove(view, r)}
            onMove={(i, j) => move(view, i, j)}
          />
        )}
      </main>

      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} className="editor" id="editor">
        {editing && (
          <EditorForm
            key={(editing.row && editing.row.id) || "new"}
            db={db}
            table={editing.table}
            row={editing.row}
            rows={rows}
            toast={toast}
            onCancel={() => setEditing(null)}
            onDone={(data, wasEdit) => saved(editing.table, data, wasEdit)}
          />
        )}
      </Modal>

      {toastNode}
    </div>
  );
}
