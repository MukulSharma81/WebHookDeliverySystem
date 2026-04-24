// src/pages/WebhookList.jsx
import { useEffect, useState } from "react";
import { Search, Plus, RefreshCw, ExternalLink, Copy, Check } from "lucide-react";
import StatusBadge from "../components/StatusBadge";
import { fetchAllWebhooks, createWebhook } from "../services/api";

const WebhookList = () => {
  const [webhooks, setWebhooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [form, setForm] = useState({ url: "", payload: "", idempotencyKey: "" });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchAllWebhooks();
      setWebhooks(res.data.data || []);
    } catch {
      setWebhooks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!form.url || !form.payload || !form.idempotencyKey) {
      setFormError("All fields are required.");
      return;
    }
    let parsedPayload;
    try {
      parsedPayload = JSON.parse(form.payload);
    } catch {
      setFormError("Payload must be valid JSON.");
      return;
    }
    setSubmitting(true);
    try {
      await createWebhook({ url: form.url, payload: parsedPayload, idempotencyKey: form.idempotencyKey });
      setShowModal(false);
      setForm({ url: "", payload: "", idempotencyKey: "" });
      load();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to create webhook.");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = webhooks.filter(w => {
    const matchStatus = filterStatus === "all" || w.status === filterStatus;
    const matchSearch = w.url?.toLowerCase().includes(search.toLowerCase()) ||
      w.idempotencyKey?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const STATUS_FILTERS = ["all", "pending", "success", "failed"];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Webhooks</h1>
          <p className="text-gray-400 text-sm mt-1">{webhooks.length} total webhooks registered</p>
        </div>
        <div className="flex gap-3">
          <button onClick={load} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-gray-300 hover:text-white transition-colors"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button id="create-webhook-btn" onClick={() => setShowModal(true)} className="btn-emerald flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> New Webhook
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by URL or idempotency key..."
            className="input-dark pl-10 w-full" />
        </div>
        <div className="flex gap-2">
          {STATUS_FILTERS.map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className="px-3 py-2 rounded-lg text-xs font-medium capitalize transition-all duration-200"
              style={{
                background: filterStatus === s ? "linear-gradient(135deg, rgba(16,185,129,0.2), rgba(6,182,212,0.1))" : "rgba(255,255,255,0.04)",
                border: filterStatus === s ? "1px solid rgba(16,185,129,0.3)" : "1px solid rgba(255,255,255,0.06)",
                color: filterStatus === s ? "#10b981" : "#9ca3af",
              }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 text-xs uppercase tracking-wider border-b"
                style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.2)" }}>
                <th className="px-6 py-4">URL</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Retries</th>
                <th className="px-6 py-4">Idempotency Key</th>
                <th className="px-6 py-4">Created</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-14">
                  <svg className="animate-spin w-6 h-6 text-emerald-400 mx-auto" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-14 text-gray-500">
                  {search || filterStatus !== "all" ? "No webhooks match your filter." : "No webhooks yet. Create your first one!"}
                </td></tr>
              ) : (
                filtered.map((w, i) => (
                  <tr key={w._id} className="table-row-hover border-b transition-colors"
                    style={{ borderColor: "rgba(255,255,255,0.04)", animationDelay: `${i * 40}ms` }}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-300 font-mono text-xs max-w-[180px] truncate">{w.url}</span>
                        <a href={w.url} target="_blank" rel="noreferrer" className="text-gray-600 hover:text-emerald-400 transition-colors shrink-0">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4"><StatusBadge status={w.status} /></td>
                    <td className="px-6 py-4">
                      <span className="text-gray-300 font-mono">{w.retryCount}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 font-mono text-xs max-w-[140px] truncate">{w.idempotencyKey}</span>
                        <button onClick={() => handleCopy(w.idempotencyKey, w._id)}
                          className="text-gray-600 hover:text-emerald-400 transition-colors shrink-0">
                          {copiedId === w._id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs whitespace-nowrap">
                      {new Date(w.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <a href={`/webhooks/${w._id}`}
                        className="text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
                        View →
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-lg rounded-2xl p-6 animate-fade-in"
            style={{ background: "#1f2937", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 25px 50px rgba(0,0,0,0.5)" }}>
            <h3 className="text-white font-bold text-lg mb-5">Create New Webhook</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-gray-300 text-xs font-medium mb-1.5">Target URL</label>
                <input value={form.url} onChange={e => setForm({...form, url: e.target.value})}
                  placeholder="https://example.com/webhook" className="input-dark" />
              </div>
              <div>
                <label className="block text-gray-300 text-xs font-medium mb-1.5">Payload (JSON)</label>
                <textarea value={form.payload} onChange={e => setForm({...form, payload: e.target.value})}
                  placeholder='{"event": "user.created", "userId": "123"}'
                  rows={4} className="input-dark font-mono text-xs resize-none" />
              </div>
              <div>
                <label className="block text-gray-300 text-xs font-medium mb-1.5">Idempotency Key</label>
                <input value={form.idempotencyKey} onChange={e => setForm({...form, idempotencyKey: e.target.value})}
                  placeholder="unique-key-001" className="input-dark" />
              </div>
              {formError && (
                <p className="text-red-400 text-xs" style={{ background: "rgba(239,68,68,0.1)", padding: "8px 12px", borderRadius: "8px", border: "1px solid rgba(239,68,68,0.2)" }}>
                  {formError}
                </p>
              )}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white transition-colors"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="flex-1 btn-emerald text-sm flex items-center justify-center gap-2">
                  {submitting ? <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg> : <Plus className="w-4 h-4" />}
                  {submitting ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebhookList;
