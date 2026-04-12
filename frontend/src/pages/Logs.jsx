// src/pages/Logs.jsx

import { useEffect, useState } from "react";
import { RefreshCw, AlertCircle, CheckCircle2, Clock, XCircle } from "lucide-react";
import { fetchAllWebhooks } from "../services/api";
import StatusBadge from "../components/StatusBadge";

const LOG_ICONS = {
  success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />,
  failed:  <XCircle      className="w-4 h-4 text-red-400    shrink-0 mt-0.5" />,
  pending: <Clock        className="w-4 h-4 text-amber-400  shrink-0 mt-0.5" />,
};

const LOG_BORDER = {
  success: "rgba(16,185,129,0.15)",
  failed:  "rgba(239,68,68,0.15)",
  pending: "rgba(245,158,11,0.15)",
};


const Logs = () => {
  const [webhooks, setWebhooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");

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

  const filtered = filterStatus === "all"
    ? webhooks
    : webhooks.filter(w => w.status === filterStatus);

  const STATUS_FILTERS = ["all", "success", "failed", "pending"];

  const formatLog = (w) => {
    const t = new Date(w.updatedAt || w.createdAt);
    if (w.status === "success") return `Webhook delivered successfully to ${w.url}`;
    if (w.status === "failed")  return `Webhook delivery failed after ${w.retryCount} retries — ${w.url}`;
    return `Webhook pending delivery (attempt ${w.retryCount + 1}) → ${w.url}`;
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Delivery Logs</h1>
          <p className="text-gray-400 text-sm mt-1">Full history of all webhook delivery attempts</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-gray-300 hover:text-white transition-colors"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Filter Pills */}
      <div className="flex gap-2 mb-6">
        {STATUS_FILTERS.map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className="px-4 py-1.5 rounded-full text-xs font-medium capitalize transition-all duration-200"
            style={{
              background: filterStatus === s ? "linear-gradient(135deg, rgba(16,185,129,0.2), rgba(6,182,212,0.1))" : "rgba(255,255,255,0.04)",
              border: filterStatus === s ? "1px solid rgba(16,185,129,0.3)" : "1px solid rgba(255,255,255,0.06)",
              color: filterStatus === s ? "#10b981" : "#9ca3af",
            }}>
            {s === "all" ? `All (${webhooks.length})` :
             s === "success" ? `✓ Success (${webhooks.filter(w=>w.status==="success").length})` :
             s === "failed" ? `✗ Failed (${webhooks.filter(w=>w.status==="failed").length})` :
             `⏳ Pending (${webhooks.filter(w=>w.status==="pending").length})`}
          </button>
        ))}
      </div>

      {/* Log Feed */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <svg className="animate-spin w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <AlertCircle className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">No logs found</p>
          <p className="text-gray-600 text-sm mt-1">
            {filterStatus !== "all" ? `No ${filterStatus} webhooks found.` : "No webhooks recorded yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((w, i) => (
            <div key={w._id}
              className="glass-card px-5 py-4 flex items-start gap-4 transition-all duration-200 animate-fade-in"
              style={{
                borderLeft: `3px solid ${LOG_BORDER[w.status] || "rgba(107,114,128,0.2)"}`,
                animationDelay: `${i * 30}ms`,
              }}>

              {LOG_ICONS[w.status] || <Clock className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <p className="text-gray-200 text-sm font-medium font-mono">{formatLog(w)}</p>
                  <StatusBadge status={w.status} />
                </div>

                {/* Meta info */}
                <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
                  <span>ID: <span className="text-gray-400 font-mono">{w._id}</span></span>
                  <span>Key: <span className="text-gray-400 font-mono">{w.idempotencyKey}</span></span>
                  <span>Retries: <span className="text-gray-400">{w.retryCount}</span></span>
                </div>

                {/* Payload preview */}
                {w.payload && (
                  <div className="mt-2 px-3 py-2 rounded-lg text-xs font-mono text-gray-400 overflow-x-auto"
                    style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.04)" }}>
                    {JSON.stringify(w.payload).slice(0, 120)}{JSON.stringify(w.payload).length > 120 ? "..." : ""}
                  </div>
                )}
              </div>

              {/* Timestamp */}
              <div className="text-right shrink-0">
                <p className="text-gray-500 text-xs whitespace-nowrap">
                  {new Date(w.updatedAt || w.createdAt).toLocaleTimeString()}
                </p>
                <p className="text-gray-600 text-xs whitespace-nowrap mt-0.5">
                  {new Date(w.updatedAt || w.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Logs;
