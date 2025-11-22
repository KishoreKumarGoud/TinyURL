import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Copy, Trash2, ArrowLeft, Check, Loader2, BarChart2 } from "lucide-react";
import { api } from "../services/api";
import Toast from "../components/Toast";

/**
 * Stats page
 * - Fetches GET /api/links/:code
 * - Shows top metrics, metadata, and actions (copy/delete/back)
 * - Responsive: two-column on md+, stacked on mobile
 * - Uses VITE_API_BASE_URL for copy so pasted link redirects to backend
 */

export default function Stats() {
  const { code } = useParams();
  const navigate = useNavigate();

  const [link, setLink] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!code) return;
    fetchLink();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  async function fetchLink() {
    setLoading(true);
    setError("");
    try {
      const res = await api.getLinkStats(code);
      if (!res.ok) {
        if (res.status === 404) setError("Link not found.");
        else setError("Failed to load link.");
        setLink(null);
        return;
      }
      setLink(res.data);
    } catch (err) {
      console.error("fetchLink error", err);
      setError("Network error.");
      setLink(null);
    } finally {
      setLoading(false);
    }
  }

  function getBackendOrigin() {
    return import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
  }

  async function handleCopy() {
    if (!link?.code) return;
    const short = `${getBackendOrigin()}/${link.code}`;
    try {
      await navigator.clipboard.writeText(short);
      setCopied(true);
      setToast({ text: "Copied to clipboard" });
      setTimeout(() => setCopied(false), 1200);
      setTimeout(() => setToast(null), 2500);
    } catch (err) {
      console.error(err);
      setToast({ text: "Copy failed", kind: "error" });
      setTimeout(() => setToast(null), 3000);
    }
  }

  async function handleDelete() {
    if (!link?.code) return;
    if (!confirm(`Delete short link "${link.code}"? This cannot be undone.`)) return;
    setBusy(true);
    try {
      const res = await api.deleteLink(link.code);
      if (!res.ok) {
        setToast({ text: "Delete failed", kind: "error" });
        setTimeout(() => setToast(null), 3000);
        return;
      }
      setToast({ text: "Deleted" });
      setTimeout(() => setToast(null), 1600);
      // navigate back to dashboard after short delay so user sees toast
      setTimeout(() => navigate("/"), 600);
    } catch (err) {
      console.error(err);
      setToast({ text: "Delete error", kind: "error" });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setBusy(false);
    }
  }

  function shortUrl() {
    if (!link?.code) return "";
    return `${getBackendOrigin()}/${link.code}`;
  }

  // friendly small formatter
  function fmtDate(v) {
    if (!v) return "—";
    try { return new Date(v).toLocaleString(); } catch { return String(v); }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <h1 className="text-2xl font-semibold">Link stats — {code}</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        {loading && (
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="animate-spin w-4 h-4" /> Loading…
          </div>
        )}

        {error && <div className="text-red-600">{error}</div>}

        {!loading && link && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left column: main info */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-4">
                <div className="px-3 py-1 rounded-md bg-indigo-50 text-indigo-700 font-semibold">{link.code}</div>
                <div className="text-sm text-gray-600">{link.url}</div>
              </div>

              <div className="rounded-lg border border-gray-100 p-4 bg-gray-50">
                <div className="text-sm text-gray-500">Target URL</div>
                <div className="mt-2 break-all">
                  <a href={link.url} target="_blank" rel="noreferrer" className="text-indigo-600 font-medium hover:underline">
                    {link.url}
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-lg p-4 bg-white border border-gray-100 shadow-sm">
                  <div className="text-xs text-gray-500">Total clicks</div>
                  <div className="text-2xl font-semibold mt-1">{link.clicks ?? 0}</div>
                </div>

                <div className="rounded-lg p-4 bg-white border border-gray-100 shadow-sm">
                  <div className="text-xs text-gray-500">Last accessed</div>
                  <div className="text-lg mt-1 text-gray-700">{fmtDate(link.last_accessed)}</div>
                </div>
              </div>

              <div className="rounded-lg p-4 bg-white border border-gray-100">
                <div className="text-xs text-gray-500">Details</div>
                <div className="mt-2 text-sm text-gray-700 space-y-1">
                  <div><span className="text-gray-500">Created:</span> {fmtDate(link.created_at)}</div>
                  <div><span className="text-gray-500">Short URL:</span> <span className="text-indigo-600 font-medium">{shortUrl()}</span></div>
                  <div><span className="text-gray-500">Code:</span> {link.code}</div>
                </div>
              </div>
            </div>

            {/* Right column: actions */}
            <aside className="space-y-4">
              <div className="rounded-lg p-4 border border-gray-100 bg-white shadow-sm">
                <div className="text-sm text-gray-500">Actions</div>

                <div className="mt-3 flex flex-col gap-2">
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-2 justify-center w-full rounded-full px-3 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm shadow hover:brightness-105"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} <span>{copied ? "Copied" : "Copy link"}</span>
                  </button>

                  <button
                    onClick={() => (window.location.href = `/code/${encodeURIComponent(link.code)}`)}
                    className="flex items-center gap-2 justify-center w-full rounded-full px-3 py-2 border border-gray-100 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <BarChart2 className="w-4 h-4" /> View detailed stats
                  </button>

                  <button
                    onClick={handleDelete}
                    disabled={busy}
                    className="inline-flex items-center gap-2 justify-center w-full rounded-full px-3 py-2 text-sm text-white bg-red-600 hover:bg-red-700 disabled:opacity-60"
                  >
                    {busy ? <Loader2 className="animate-spin w-4 h-4" /> : <Trash2 className="w-4 h-4" />} Delete link
                  </button>
                </div>
              </div>

              <div className="text-xs text-gray-500">
                <div className="mb-2">Helpful tips</div>
                <ul className="list-disc list-inside space-y-1">
                  <li>Use the copy button to get a redirectable short link.</li>
                  <li>Clicks update when users open the short link (backend redirect route).</li>
                </ul>
              </div>
            </aside>
          </div>
        )}
      </div>

   {toast && (
  <Toast
    text={toast.text}
    kind={toast.kind}
    onClose={() => setToast(null)}
  />
)}

    </div>
  );
}
