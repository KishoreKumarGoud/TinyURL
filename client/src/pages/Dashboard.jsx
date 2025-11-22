import { useEffect, useState } from "react";
import { Copy, Trash2, BarChart2, Check, Loader2 } from "lucide-react";
import { api } from "../services/api";
import Toast from "../components/Toast";   // ← NEW
import ConfirmModal from "../components/ConfirmModal";


export default function Dashboard() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
const [pendingDelete, setPendingDelete] = useState(null);

  const [globalError, setGlobalError] = useState("");
const [sort, setSort] = useState("newest");

  const [url, setUrl] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [fieldError, setFieldError] = useState({});
  const [toast, setToast] = useState(null);
  const [copied, setCopied] = useState({});

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

  function getBackendOrigin() {
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

      setLinks((ls) => ls.filter((x) => x.code !== codeToDelete)); // optimistic update
      showToast("Deleted");

      setTimeout(() => loadLinks(), 400);
    } catch (err) {
      console.error(err);
      showToast("Delete error", "error");
    }
  }
const sorted = [...links].sort((a, b) => {
  switch (sort) {
    case "oldest":
      return new Date(a.created_at) - new Date(b.created_at);

    case "most":
      return (b.clicks ?? 0) - (a.clicks ?? 0);

    case "least":
      return (a.clicks ?? 0) - (b.clicks ?? 0);

    case "newest":
    default:
      return new Date(b.created_at) - new Date(a.created_at);
  }
});

  return (
    <div className="space-y-6">
      {/* Create card */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-xl font-semibold">Create a short link</h2>
        <p className="text-sm text-gray-500 mt-1">Paste a URL and optionally choose a custom code.</p>

        <form onSubmit={handleCreate} className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-700">Target URL</label>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 focus:ring-2 focus:ring-indigo-200"
            />
            {fieldError.url && <p className="text-xs text-red-600 mt-1">{fieldError.url}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Custom code (optional)</label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="my-code"
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 focus:ring-2 focus:ring-indigo-200"
            />
            {fieldError.code && <p className="text-xs text-red-600 mt-1">{fieldError.code}</p>}

            <div className="flex gap-2 mt-3">
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
                className="text-sm text-gray-600 px-3 py-1 rounded-md border border-gray-200"
              >
                Reset
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Table + Cards */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-3">
  <h3 className="text-lg font-medium">Your links</h3>
<div className="flex items-center gap-6">
  <select
    value={sort}
    onChange={(e) => setSort(e.target.value)}
    className="text-sm border border-gray-200 rounded-lg px-2 py-1"
  >
    <option value="newest">Newest first</option>
    <option value="oldest">Oldest first</option>
    <option value="most">Most clicked</option>
    <option value="least">Least clicked</option>
  </select>



          <div className="text-sm text-gray-500">{loading ? "Loading…" : `${links.length} total`}</div>
        </div>
</div>
        {globalError && <div className="text-sm text-red-600 mb-3">{globalError}</div>}

        {/* Desktop table */}
        <div className="hidden md:block">
          <table className="w-full text-sm">
            <thead className="text-left text-gray-500">
              <tr>
                <th className="pb-2">Code</th>
                <th className="pb-2">URL</th>
                <th className="pb-2">Clicks</th>
                <th className="pb-2">Last clicked</th>
                <th className="pb-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sorted.map((l) => (
                <tr key={l.code} className="hover:bg-gray-50">
                  <td className="py-3">
                    <a className="inline-flex items-center gap-2 text-indigo-600 font-medium" href={`/${l.code}`} target="_blank">
                      <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md">{l.code}</span>
                    </a>
                  </td>

                  <td className="py-3 max-w-xs truncate">{l.url}</td>
                  <td className="py-3">{l.clicks ?? 0}</td>
                  <td className="py-3 text-gray-500">{l.last_accessed ? new Date(l.last_accessed).toLocaleString() : "—"}</td>

                  <td className="py-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button onClick={() => handleCopy(l.code)} className="p-2 rounded-md hover:bg-gray-100">
                        {copied[l.code] ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-gray-600" />}
                      </button>

                      <button onClick={() => (window.location.href = `/code/${l.code}`)} className="p-2 rounded-md hover:bg-gray-100">
                        <BarChart2 className="w-4 h-4 text-gray-600" />
                      </button>

                      <button onClick={() => {
  setPendingDelete(l.code);
  setConfirmOpen(true);
}}
 className="p-2 rounded-md hover:bg-red-50">
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {sorted.map((l) => (
            <div key={l.code} className="border rounded-lg p-3 bg-white shadow-sm">
              <div className="flex justify-between items-start gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <a
                      className="text-indigo-600 font-medium"
                      href={`/${l.code}`}
                      target="_blank"
                    >
                      <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md">
                        {l.code}
                      </span>
                    </a>

                    <div className="truncate text-sm">{l.url}</div>
                  </div>

                  <div className="text-xs text-gray-400 mt-2">
                    Clicks: {l.clicks ?? 0} • Last:{" "}
                    {l.last_accessed ? new Date(l.last_accessed).toLocaleString() : "—"}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => handleCopy(l.code)} className="p-2 rounded-md hover:bg-gray-100">
                    {copied[l.code] ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-gray-600" />}
                  </button>

                  <button onClick={() => (window.location.href = `/code/${l.code}`)} className="p-2 rounded-md hover:bg-gray-100">
                    <BarChart2 className="w-4 h-4 text-gray-600" />
                  </button>

                  <button onClick={() => {
  setPendingDelete(l.code);
  setConfirmOpen(true);
}}
 className="p-2 rounded-md hover:bg-red-50">
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Toast from shared component */}
      {toast && (
        <Toast
          text={toast.text}
          kind={toast.kind}
          onClose={() => setToast(null)}
        />
      )}
      <ConfirmModal
  show={confirmOpen}
  title="Delete short link?"
  message={`"${pendingDelete}" will be permanently removed.`}
  confirmText="Delete"
  cancelText="Cancel"
  onCancel={() => {
    setConfirmOpen(false);
    setPendingDelete(null);
  }}
  onConfirm={() => {
    setConfirmOpen(false);
    handleDelete(pendingDelete);
    setPendingDelete(null);
  }}
/>

    </div>
  );
}
