import { siteRoot } from "./utils";

const BACKENDS = {
  php: {
    api: "server/api.php",
    publicPrefix: "uploads/",
    maxUploadMB: 8,
    unreachable: "Couldn't reach the XAMPP backend. Make sure Apache is running in the XAMPP Control Panel.",
    notJson: (status) => `The XAMPP backend returned an unexpected response (HTTP ${status}). Is the server folder next to index.html?`
  },
  netlify: {
    api: "api",
    publicPrefix: "media/",
    maxUploadMB: 5,
    unreachable: "Couldn't reach the Netlify backend. Check your internet connection and try again.",
    notJson: (status) => `The Netlify backend isn't answering (HTTP ${status}). Make sure the site was deployed from GitHub so its functions are included.`
  }
};

const WRITES = new Set(["insert", "update", "upsert", "delete"]);

function makeCall(kind) {
  const cfg = BACKENDS[kind];
  const API = new URL(cfg.api, siteRoot).href;
  let queue = Promise.resolve();

  return function call(action, payload, isForm) {
    const run = () => send(action, payload, isForm);
    if (!WRITES.has(action)) return run();
    const result = queue.then(run, run);
    queue = result.catch(() => {});
    return result;
  };

  async function send(action, payload, isForm) {
    try {
      const res = await fetch(`${API}?action=${encodeURIComponent(action)}`, {
        method: payload === undefined ? "GET" : "POST",
        credentials: "same-origin",
        headers: isForm ? { "X-Portfolio": "1" } : { "X-Portfolio": "1", "Content-Type": "application/json" },
        body: payload === undefined ? undefined : isForm ? payload : JSON.stringify(payload)
      });
      const text = await res.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch {
        return {
          data: null,
          error: {
            message: /<\?php/.test(text)
              ? "PHP isn't running this file. Open the site through XAMPP (http://localhost/...)."
              : cfg.notJson(res.status)
          }
        };
      }
      return { data: json.data ?? null, error: json.error || (res.ok ? null : { message: `HTTP ${res.status}` }) };
    } catch {
      return { data: null, error: { message: cfg.unreachable } };
    }
  }
}

function query(call, table) {
  const st = { op: "select", payload: null, filters: [], order: null, single: false, maybe: false };

  async function run() {
    let r;
    if (st.op === "select") r = await call("select", { table, filters: st.filters, order: st.order });
    else if (st.op === "insert") r = await call("insert", { table, rows: st.payload });
    else if (st.op === "update") r = await call("update", { table, values: st.payload, filters: st.filters });
    else if (st.op === "upsert") r = await call("upsert", { table, row: st.payload });
    else if (st.op === "delete") r = await call("delete", { table, filters: st.filters });
    if (r.error) return { data: null, error: r.error };
    let data = r.data;
    if (st.single) {
      data = Array.isArray(data) ? data[0] || null : data;
      if (!data && !st.maybe) return { data: null, error: { message: "No matching row was found." } };
    }
    return { data, error: null };
  }

  const api = {
    select() { return api; },
    eq(column, value) { st.filters.push([column, value]); return api; },
    order(column, opts) { st.order = { column, ascending: !opts || opts.ascending !== false }; return api; },
    single() { st.single = true; return api; },
    maybeSingle() { st.single = true; st.maybe = true; return api; },
    insert(payload) { st.op = "insert"; st.payload = payload; return api; },
    update(payload) { st.op = "update"; st.payload = payload; return api; },
    upsert(payload) { st.op = "upsert"; st.payload = payload; return api; },
    delete() { st.op = "delete"; return api; },
    then(resolve, reject) { return run().then(resolve, reject); }
  };
  return api;
}

export function createApiClient(kind) {
  const cfg = BACKENDS[kind];
  const call = makeCall(kind);
  return {
    kind,
    isPhp: kind === "php",
    maxUploadMB: cfg.maxUploadMB,
    from: (table) => query(call, table),
    auth: {
      async getSession() {
        const r = await call("session");
        return { data: { session: r.data && r.data.user ? { user: r.data.user } : null }, error: r.error };
      },
      async signInWithPassword({ email, password }) {
        const r = await call("login", { email, password });
        return { data: { session: r.data && r.data.user ? { user: r.data.user } : null }, error: r.error };
      },
      async signOut() {
        await call("logout", {});
        return { error: null };
      }
    },
    storage: {
      from() {
        return {
          async upload(path, file) {
            const form = new FormData();
            form.append("path", path);
            form.append("file", file);
            const r = await call("upload", form, true);
            return { data: r.data, error: r.error };
          },
          getPublicUrl(path) {
            return { data: { publicUrl: `${cfg.publicPrefix}${path}` } };
          }
        };
      }
    }
  };
}
