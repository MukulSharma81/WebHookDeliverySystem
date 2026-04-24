// src/pages/Dashboard.jsx

import { useEffect, useState } from "react";
import { Activity, CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";
import { fetchAllWebhooks } from "../services/api";

const PIE_COLORS = ["#10b981", "#ef4444", "#f59e0b"];
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div
        className="rounded-lg px-4 py-2.5 text-sm"
        style={{
          background: "#1f2937",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <p className="text-gray-400 text-xs mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="font-semibold">
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const [webhooks, setWebhooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadWebhooks = async () => {
    setLoading(true);
    try {
      const res = await fetchAllWebhooks();
      setWebhooks(res.data.data || []);
    } catch {
      // Use mock data if API not available
      setWebhooks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWebhooks();
  }, []);

  const stats = {
    total: webhooks.length,
    success: webhooks.filter((w) => w.status === "success").length,
    failed: webhooks.filter((w) => w.status === "failed").length,
    pending: webhooks.filter((w) => w.status === "pending").length,
  };

  // Mock area chart data (last 7 days)
  const areaData = [
    { day: "Mon", success: 12, failed: 2, pending: 3 },
    { day: "Tue", success: 18, failed: 1, pending: 5 },
    { day: "Wed", success: 9, failed: 4, pending: 2 },
    { day: "Thu", success: 24, failed: 0, pending: 4 },
    { day: "Fri", success: 15, failed: 3, pending: 1 },
    { day: "Sat", success: 20, failed: 2, pending: 6 },
    {
      day: "Sun",
      success: stats.success || 8,
      failed: stats.failed || 1,
      pending: stats.pending || 3,
    },
  ];

  const pieData = [
    { name: "Success", value: stats.success || 65 },
    { name: "Failed", value: stats.failed || 15 },
    { name: "Pending", value: stats.pending || 20 },
  ];

  const recent = webhooks.slice(0, 5);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">
            Monitor your webhook delivery in real-time
          </p>
        </div>
        <button
          onClick={loadWebhooks}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white transition-colors"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Stat Cards */}
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <div className="hover:scale-105 transition duration-300">
          <StatCard
            title="Total Webhooks"
            value={stats.total}
            icon={Activity}
            color="blue"
            trend="All time"
          />
        </div>

        <div className="hover:scale-105 transition duration-300">
          <StatCard
            title="Successful"
            value={stats.success}
            icon={CheckCircle}
            color="emerald"
            trend="Delivered"
          />
        </div>

        <div className="hover:scale-105 transition duration-300">
          <StatCard
            title="Failed"
            value={stats.failed}
            icon={XCircle}
            color="red"
            trend="Need attention"
          />
        </div>

        <div className="hover:scale-105 transition duration-300">
          <StatCard
            title="Pending"
            value={stats.pending}
            icon={Clock}
            color="amber"
            trend="In queue"
          />
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* Area Chart */}
        <div className="xl:col-span-2 glass-card p-6">
          <h2 className="text-white font-semibold mb-1">Delivery Trends</h2>
          <p className="text-gray-500 text-xs mb-5">
            Last 7 days webhook activity
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart
              data={areaData}
              margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="gradSuccess" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradFailed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.04)"
              />
              <XAxis
                dataKey="day"
                tick={{ fill: "#6b7280", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#6b7280", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="success"
                name="Success"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#gradSuccess)"
              />
              <Area
                type="monotone"
                dataKey="failed"
                name="Failed"
                stroke="#ef4444"
                strokeWidth={2}
                fill="url(#gradFailed)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Donut Chart */}
        <div className="glass-card p-6">
          <h2 className="text-white font-semibold mb-1">Status Distribution</h2>
          <p className="text-gray-500 text-xs mb-2">Current breakdown</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="45%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i]} opacity={0.9} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value) => (
                  <span style={{ color: "#9ca3af", fontSize: "12px" }}>
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Webhooks Table */}
      <div className="glass-card p-6">
        <h2 className="text-white font-semibold mb-4">Recent Webhooks</h2>
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <svg
              className="animate-spin w-6 h-6 text-emerald-400"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
          </div>
        ) : recent.length === 0 ? (
          <div className="text-center py-10 text-gray-500 text-sm">
            No webhooks yet. Start by creating one!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr
                  className="text-left text-gray-500 text-xs uppercase tracking-wider border-b"
                  style={{ borderColor: "rgba(255,255,255,0.06)" }}
                >
                  <th className="pb-3 pr-4">URL</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 pr-4">Retries</th>
                  <th className="pb-3">Created</th>
                </tr>
              </thead>
              <tbody
                className="divide-y"
                style={{
                  "--tw-divide-opacity": 1,
                  borderColor: "rgba(255,255,255,0.04)",
                }}
              >
                {recent.map((w) => (
                  <tr key={w._id} className="table-row-hover transition-colors">
                    <td className="py-3 pr-4 text-gray-300 font-mono text-xs max-w-[200px] truncate">
                      {w.url}
                    </td>
                    <td className="py-3 pr-4">
                      <StatusBadge status={w.status} />
                    </td>
                    <td className="py-3 pr-4 text-gray-400">{w.retryCount}</td>
                    <td className="py-3 text-gray-500 text-xs">
                      {new Date(w.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
