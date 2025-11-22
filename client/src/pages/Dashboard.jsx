import { useEffect, useState } from "react";
import { Copy, Trash2, BarChart2, Check, Loader2 } from "lucide-react";
import { api } from "../services/api";

/**
 * Dashboard - modern, clean, aligned inputs.
 * Hybrid layout: table on md+, cards on mobile.
 * Copy uses backend URL from VITE_API_BASE_URL (fallback http://localhost:4000)
 */

// small toast
function Toast({ kind = "success", text, onClose }) {
  return (
    <div className={`fixed right-4 bottom-6 z-50 rounded-lg px-4 py-2 text-sm shadow transition-all
      ${kind === "error" ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-800"}`}>
      <div className="flex items-center gap-3">
        <div className="truncate">{text}</div>
        <button onClick={onClose} className="text-xs text-gray-600">✕</button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalError, setGlobalError] = useState("");

  const [url, setUrl] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [fieldError, setFieldError] = useState({});
  const [toast, setToast] = useState(null);
  const [copied, setCopied] = useState({});

  // load links
  async function loadLinks() {
    setLoading(true);
    setGlobalError("");
    try {
      const res = await api.getLinks();
      if (!res.ok) throw new Error(`Load failed (${res.status})`);
      const data = res.data;
      setLinks(Array.isArray(data) ? data : data?.rows ?? []);
    } catch (err) {
      console.error(err);
      setGlobalError("Unable to load links. Try refreshing.");
      setLinks([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLinks();
  }, []);

  // validation
  function isValidUrl(v) {
    try {
      new URL(v);
      return true;
    } catch {
      return false;
    }
  }

  function showToast(text, kind = "success", ttl = 3000) {
    setToast({ text, kind });
    setTimeout(() => setToast(null), ttl);
  }

  async function handleCreate(e) {
    e.preventDefault();
    setFieldError({});
    const u = url.trim();
    const c = code.trim();

    if (!u) {
      setFieldError({ url: "URL is required" });
      return;
    }
    if (!isValidUrl(u)) {
      setFieldError({ url: "Include protocol (https://)" });
      return;
    }
    if (c && !/^[A-Za-z0-9_-]{4,12}$/.test(c)) {
      setFieldError({ code: "4–12 chars: letters/numbers/-/_" });
      return;
    }

    setBusy(true);
    try {
      const payload = c ? { url: u, code: c } : { url: u };
      const res = await api.createLink(payload);
      if (!res.ok) {
        if (res.status === 409) setFieldError({ code: "Short code already exists" });
        else showToast("Server error while creating link", "error");
        return;
      }
      showToast(`Created: ${window.location.origin}/${res.data.code}`);
      setUrl("");
      setCode("");
      await loadLinks();
    } catch (err) {
      console.error(err);
      showToast("Network error", "error");
    } finally {
      setBusy(false);
    }
  }

  // copy uses backend origin so pasted link redirects correctly
  function getBackendOrigin() {
    // Vite env: VITE_API_BASE_URL
    return import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
  }

  async function handleCopy(codeToCopy) {
    const short = `${getBackendOrigin()}/${codeToCopy}`;
    try {
      await navigator.clipboard.writeText(short);
      setCopied((s) => ({ ...s, [codeToCopy]: true }));
      setTimeout(() => setCopied((s) => ({ ...s, [codeToCopy]: false })), 1200);
      showToast("Copied to clipboard");
    } catch (err) {
      console.error(err);
      showToast("Copy failed", "error");
    }
  }

  async function handleDelete(codeToDelete) {
    if (!confirm(`Delete short link "${codeToDelete}"? This cannot be undone.`)) return;
    try {
      const res = await api.deleteLink(codeToDelete);
      if (!res.ok) {
        showToast("Delete failed", "error");
        return;
      }
      // optimistic UI remove for snappy feeling
      setLinks((ls) => ls.filter((x) => x.code !== codeToDelete));
      showToast("Deleted");
      // refresh in background
      setTimeout(() => loadLinks(), 400);
    } catch (err) {
      console.error(err);
      showToast("Delete error", "error");
    }
  }

  return (
    <div className="space-y-6">
      {/* Create card */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Create a short link</h2>
            <p className="text-sm text-gray-500 mt-1">Paste a URL and optionally choose a custom code.</p>
          </div>
        </div>

        <form onSubmit={handleCreate} className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-700">Target URL</label>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/path"
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
            {fieldError.url && <p className="text-xs text-red-600 mt-1">{fieldError.url}</p>}
            <p className="text-xs text-gray-400 mt-1">Tip: include https:// to avoid validation problems.</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Custom code (optional)</label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="my-code"
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
            {fieldError.code && <p className="text-xs text-red-600 mt-1">{fieldError.code}</p>}

            <div className="flex items-center gap-2 mt-3">
              <button
                type="submit"
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-4 py-2 text-sm shadow hover:brightness-105 disabled:opacity-60"
              >
                {busy ? <Loader2 className="animate-spin w-4 h-4" /> : "Create"}
              </button>

              <button
                type="button"
                onClick={() => { setUrl(""); setCode(""); setFieldError({}); }}
                className="text-sm text-gray-600 px-3 py-1 rounded-md border border-gray-100"
              >
                Reset
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* List: table on md+, cards on small screens */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium">Your links</h3>
          <div className="text-sm text-gray-500">{loading ? "Loading…" : `${links.length} total`}</div>
        </div>

        {globalError && <div className="text-sm text-red-600 mb-3">{globalError}</div>}

        {/* Table for md+ */}
        <div className="hidden md:block">
          <table className="w-full text-sm">
            <thead className="text-left text-gray-500">
              <tr>
                <th className="pb-2">Code</th>
                <th className="pb-2">Target URL</th>
                <th className="pb-2">Clicks</th>
                <th className="pb-2">Last clicked</th>
                <th className="pb-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {links.map((l) => (
                <tr key={l.code} className="hover:bg-gray-50">
                  <td className="py-3">
                    <a className="inline-flex items-center gap-2 text-indigo-600 font-medium" href={`/${l.code}`} target="_blank" rel="noreferrer">
                      <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md">{l.code}</span>
                    </a>
                  </td>
                  <td className="py-3 max-w-xs truncate">{l.url}</td>
                  <td className="py-3">{l.clicks ?? 0}</td>
                  <td className="py-3 text-gray-500">{l.last_accessed ? new Date(l.last_accessed).toLocaleString() : "—"}</td>
                  <td className="py-3 text-right">
                    <div className="inline-flex items-center gap-2 justify-end">
                      <button
                        onClick={() => handleCopy(l.code)}
                        title="Copy short link"
                        className="p-2 rounded-md hover:bg-gray-100"
                      >
                        {copied[l.code] ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-gray-600" />}
                      </button>

                      <button
                        onClick={() => (window.location.href = `/code/${encodeURIComponent(l.code)}`)}
                        title="View stats"
                        className="p-2 rounded-md hover:bg-gray-100"
                      >
                        <BarChart2 className="w-4 h-4 text-gray-600" />
                      </button>

                      <button
                        onClick={() => handleDelete(l.code)}
                        title="Delete"
                        className="p-2 rounded-md hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Cards for small screens */}
        <div className="md:hidden space-y-3">
          {links.map((l) => (
            <div key={l.code} className="border rounded-lg p-3 bg-white shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <a className="font-medium text-indigo-600" href={`/${l.code}`} target="_blank" rel="noreferrer">
                      <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md">{l.code}</span>
                    </a>
                    <div className="truncate text-sm text-gray-700">{l.url}</div>
                  </div>

                  <div className="text-xs text-gray-400 mt-2">Clicks: {l.clicks ?? 0} • Last: {l.last_accessed ? new Date(l.last_accessed).toLocaleString() : "—"}</div>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <button onClick={() => handleCopy(l.code)} className="p-2 rounded-md hover:bg-gray-100">
                    {copied[l.code] ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-gray-600" />}
                  </button>
                  <button onClick={() => (window.location.href = `/code/${encodeURIComponent(l.code)}`)} className="p-2 rounded-md hover:bg-gray-100">
                    <BarChart2 className="w-4 h-4 text-gray-600" />
                  </button>
                  <button onClick={() => handleDelete(l.code)} className="p-2 rounded-md hover:bg-red-50">
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* toast */}
      {toast && <Toast kind={toast.kind} text={toast.text} onClose={() => setToast(null)} />}
    </div>
  );
}
