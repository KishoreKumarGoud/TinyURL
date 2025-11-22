const BASE = import.meta.env.VITE_API_BASE_URL; 
console.log("API BASE →", BASE);

async function request(path, { method = "GET", body } = {}) {
  const opts = { method, headers: {} };

  if (body) {
    opts.headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(body);
  }

  const res = await fetch(`${BASE}${path}`, opts);
  const text = await res.text();

  try {
    return {
      ok: res.ok,
      status: res.status,
      data: text ? JSON.parse(text) : null,
    };
  } catch {
    return { ok: res.ok, status: res.status, data: text };
  }
}

export const api = {
  getLinks: () => request("/api/links"),
  createLink: (payload) =>
    request("/api/links", { method: "POST", body: payload }),
  deleteLink: (code) =>
    request(`/api/links/${encodeURIComponent(code)}`, {
      method: "DELETE",
    }),
  getLinkStats: (code) =>
    request(`/api/links/${encodeURIComponent(code)}`),
};
