import { useEffect, useState } from "react";
import { api } from "../services/api";

/**
 * Professional, friendly Dashboard with inline styles only.
 * - Inline style objects (no index.css changes)
 * - Accessible, simple, and polished UI
 * - Create form, list, copy, delete, toast, inline validation
 */

/* Inline style objects */
const styles = {
  card: {
    background: "#ffffff",
    borderRadius: 16,
    padding: 16,
    boxShadow: "0 6px 18px rgba(16,24,40,0.06)",
    transition: "box-shadow .18s ease, transform .12s ease",
  },
  cardHover: {
    boxShadow: "0 10px 30px rgba(16,24,40,0.12)",
    transform: "translateY(-2px)",
  },
  primaryBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 16px",
    borderRadius: 9999,
    background: "linear-gradient(90deg,#6366f1,#8b5cf6)",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    boxShadow: "0 6px 18px rgba(99,102,241,0.18)",
    transition: "transform .12s ease, box-shadow .12s ease",
  },
  ghostBtn: {
    padding: "8px 12px",
    borderRadius: 12,
    border: "1px solid #e6e9ef",
    background: "transparent",
    cursor: "pointer",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #e6e9ef",
    outline: "none",
    transition: "box-shadow .12s ease, border-color .12s ease",
  },
  smallMuted: {
    fontSize: 13,
    color: "#6b7280",
  },
  pillCode: {
    background: "#eef2ff",
    color: "#4f46e5",
    padding: "6px 10px",
    borderRadius: 10,
    fontWeight: 600,
  },
  toast: {
    position: "fixed",
    right: 20,
    bottom: 20,
    background: "#f0fdf4",
    color: "#065f46",
    padding: "10px 14px",
    borderRadius: 12,
    boxShadow: "0 8px 24px rgba(16,24,40,0.08)",
    zIndex: 2000,
  },
  toastError: {
    background: "#fff1f2",
    color: "#991b1b",
  },
  rowCard: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    borderRadius: 12,
    padding: 12,
    border: "1px solid #f1f5f9",
  },
  smallButton: {
    padding: "6px 10px",
    borderRadius: 10,
    border: "1px solid #e6e9ef",
    background: "white",
    cursor: "pointer",
  },
};

function Toast({ text, kind = "success", onClose }) {
  const tStyle = { ...styles.toast, ...(kind === "error" ? styles.toastError : {}) };
  return (
    <div style={tStyle} role="status" aria-live="polite">
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <div style={{ flex: 1 }}>{text}</div>
        <button onClick={onClose} style={{ ...styles.smallButton, border: "none", background: "transparent" }}>
          ✕
        </button>
      </div>
    </div>
  );
}

function Spinner({ size = 16 }) {
  return (
    <svg style={{ width: size, height: size }} viewBox="0 0 24 24" className="animate-spin" aria-hidden>
      <circle cx="12" cy="12" r="10" stroke="#c7d2fe" strokeWidth="4" fill="none" />
      <path d="M22 12a10 10 0 00-10-10" stroke="#6366f1" strokeWidth="4" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export default function Dashboard() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalError, setGlobalError] = useState(null);

  const [url, setUrl] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [fieldError, setFieldError] = useState({});
  const [toast, setToast] = useState(null);
  const [hoverIdx, setHoverIdx] = useState(null);

  useEffect(() => {
    loadLinks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadLinks() {
    setLoading(true);
    setGlobalError(null);
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

  function isValidUrl(v) {
    try {
      new URL(v);
      return true;
    } catch {
      return false;
    }
  }

  function showToast(text, kind = "success", ttl = 3500) {
    setToast({ text, kind });
    setTimeout(() => setToast(null), ttl);
  }

  async function handleCreate(e) {
    e.preventDefault();
    setFieldError({});
    const trimmedUrl = url.trim();
    const trimmedCode = code.trim();

    if (!trimmedUrl) {
      setFieldError({ url: "Please enter a URL." });
      return;
    }
    if (!isValidUrl(trimmedUrl)) {
      setFieldError({ url: "Please include protocol, e.g. https://." });
      return;
    }
    if (trimmedCode && !/^[A-Za-z0-9_-]{4,12}$/.test(trimmedCode)) {
      setFieldError({ code: "4–12 chars: letters, numbers, - or _" });
      return;
    }

    setBusy(true);
    try {
      const payload = trimmedCode ? { url: trimmedUrl, code: trimmedCode } : { url: trimmedUrl };
      const res = await api.createLink(payload);
      if (!res.ok) {
        if (res.status === 409) {
          setFieldError({ code: "Short code already exists." });
        } else {
          showToast("Server error while creating link", "error");
        }
        return;
      }
      const short = `${window.location.origin}/${res.data.code}`;
      showToast(`Created ${short}`);
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

  async function handleCopy(codeToCopy) {
    const short = `${window.location.origin}/${codeToCopy}`;
    try {
      await navigator.clipboard.writeText(short);
      showToast("Copied to clipboard");
    } catch {
      showToast("Copy failed", "error");
    }
  }

  async function handleDelete(codeToDelete) {
    const ok = confirm(`Delete short link "${codeToDelete}"?`);
    if (!ok) return;
    try {
      const res = await api.deleteLink(codeToDelete);
      if (!res.ok) {
        showToast("Delete failed", "error");
        return;
      }
      showToast("Deleted");
      await loadLinks();
    } catch (err) {
      console.error(err);
      showToast("Delete error", "error");
    }
  }

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {/* Create card */}
      <div
        style={{
          ...styles.card,
          padding: 20,
        }}
        onMouseLeave={() => setHoverIdx(null)}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>Create a friendly short link</div>
            <div style={{ marginTop: 6, ...styles.smallMuted }}>Paste a link. Optionally choose a custom code.</div>
          </div>
        </div>

        <form onSubmit={handleCreate} style={{ marginTop: 16, display: "grid", gap: 12, gridTemplateColumns: "1fr 260px" }}>
          <div style={{ gridColumn: "1 / 2" }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Target URL</label>
            <input
              style={styles.input}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              aria-invalid={!!fieldError.url}
              onFocus={(e) => (e.target.style.boxShadow = "0 6px 18px rgba(99,102,241,0.12)")}
              onBlur={(e) => (e.target.style.boxShadow = "none")}
            />
            {fieldError.url && <div style={{ color: "#dc2626", fontSize: 13, marginTop: 6 }}>{fieldError.url}</div>}
            <div style={{ marginTop: 8, ...styles.smallMuted }}>Example: https://news.yoursite.com/your-long-article</div>
          </div>

          <div style={{ gridColumn: "2 / 3" }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Custom short code (optional)</label>
            <input
              style={styles.input}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="my-code"
              aria-invalid={!!fieldError.code}
              onFocus={(e) => (e.target.style.boxShadow = "0 6px 18px rgba(99,102,241,0.12)")}
              onBlur={(e) => (e.target.style.boxShadow = "none")}
            />
            {fieldError.code && <div style={{ color: "#dc2626", fontSize: 13, marginTop: 6 }}>{fieldError.code}</div>}
            <div style={{ marginTop: 8, ...styles.smallMuted }}>4–12 characters: letters, numbers, -, _</div>

            <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
              <button
                style={{ ...styles.primaryBtn, opacity: busy ? 0.66 : 1 }}
                disabled={busy}
                aria-disabled={busy}
                type="submit"
              >
                {busy ? <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><Spinner size={14} /> Creating…</span> : "✨ Create"}
              </button>

              <button
                type="button"
                style={styles.ghostBtn}
                onClick={() => {
                  setUrl("");
                  setCode("");
                  setFieldError({});
                }}
              >
                Reset
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Links list */}
      <div style={styles.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>Your links</div>
          <div style={styles.smallMuted}>{loading ? "Loading…" : `${links.length} total`}</div>
        </div>

        {globalError && <div style={{ color: "#dc2626", marginBottom: 12 }}>{globalError}</div>}

        {loading && (
          <div style={{ padding: 12, ...styles.smallMuted }}>
            <Spinner size={18} /> Loading links...
          </div>
        )}

        {!loading && links.length === 0 && <div style={styles.smallMuted}>No links yet — create one above.</div>}

        {!loading && links.length > 0 && (
          <div style={{ display: "grid", gap: 10 }}>
            {links.map((l, idx) => {
              const hovered = hoverIdx === idx;
              return (
                <div
                  key={l.code}
                  style={{
                    ...styles.rowCard,
                    ...(hovered ? styles.cardHover : {}),
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                  onMouseEnter={() => setHoverIdx(idx)}
                  onMouseLeave={() => setHoverIdx(null)}
                >
                  <div style={{ display: "flex", gap: 12, alignItems: "center", minWidth: 0 }}>
                    <a
                      href={`/${l.code}`}
                      target="_blank"
                      rel="noreferrer"
                      style={styles.pillCode}
                    >
                      {l.code}
                    </a>

                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 520 }}>{l.url}</div>
                      <div style={{ marginTop: 6, ...styles.smallMuted, fontSize: 12 }}>
                        Created: {new Date(l.created_at).toLocaleString()} • Clicks: {l.clicks ?? 0} • Last: {l.last_accessed ? new Date(l.last_accessed).toLocaleString() : "—"}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <button
                      onClick={() => handleCopy(l.code)}
                      style={styles.smallButton}
                      aria-label={`Copy ${l.code}`}
                    >
                      Copy
                    </button>

                    <button
                      onClick={() => (window.location.href = `/code/${encodeURIComponent(l.code)}`)}
                      style={styles.smallButton}
                    >
                      Stats
                    </button>

                    <button
                      onClick={() => handleDelete(l.code)}
                      style={{ ...styles.smallButton, color: "#dc2626", borderColor: "#fee2e2", background: hovered ? "#fff7f7" : "white" }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {toast && <Toast text={toast.text} kind={toast.kind} onClose={() => setToast(null)} />}
    </div>
  );
}
