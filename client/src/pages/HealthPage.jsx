/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { api } from "../services/api";
import { CheckCircle, XCircle, Clock } from "lucide-react";

export default function HealthPage() {
  const [backend, setBackend] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
 async function load() {
  try {
    const url = import.meta.env.VITE_API_BASE_URL + "/healthz";
    console.log("🔵 Calling backend health:", url);

    const res = await fetch(url);

    console.log("🟡 Raw response:", res);

    const data = await res.json();
    console.log("🟢 Parsed health data:", data);

    setBackend({ ok: true, ...data });
  } catch (err) {
    console.log("🔴 Health fetch failed:", err);
    setBackend({ ok: false });
  } finally {
    setLoading(false);
  }
}

    load();
  }, []);

  function Item({ label, value, ok }) {
    return (
      <div className=" rounded-xl p-4 bg-white shadow-sm flex items-center justify-between">
        <span className="text-gray-600">{label}</span>
        <span className="flex items-center gap-2">
          {ok === false && <XCircle className="w-5 h-5 text-red-500" />}
          {ok === true && <CheckCircle className="w-5 h-5 text-emerald-500" />}
          <span className="font-medium">{value}</span>
        </span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">System Health</h1>
      <p className="text-gray-500">Monitor API & application uptime.</p>

      {loading ? (
        <p className="text-gray-500">Checking health…</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          <Item
            label="API Status"
            value={backend?.ok ? "Online" : "Offline"}
            ok={backend?.ok}
          />

          <Item
            label="Version"
            value={backend?.version || "—"}
            ok={backend?.ok}
          />

          <Item
            label="Uptime"
            value={
              backend?.uptime
                ? Math.floor(backend.uptime) + "s"
                : "—"
            }
            ok={backend?.ok}
          />

          <Item
            label="Database"
            value={backend?.db || "Unknown"}
            ok={backend?.db === "connected"}
          />
        </div>
      )}
    </div>
  );
}
