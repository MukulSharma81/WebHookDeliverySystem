// src/components/StatCard.jsx

const StatCard = ({ title, value, icon: Icon, color = "emerald", trend }) => {
  const colorMap = {
    emerald: {
      glow: "rgba(16,185,129,0.25)",
      gradient: "linear-gradient(135deg, rgba(16,185,129,0.15), rgba(6,182,212,0.08))",
      border: "rgba(16,185,129,0.25)",
      text: "#10b981",
      iconBg: "linear-gradient(135deg, #10b981, #06b6d4)",
    },
    red: {
      glow: "rgba(239,68,68,0.2)",
      gradient: "linear-gradient(135deg, rgba(239,68,68,0.12), rgba(239,68,68,0.05))",
      border: "rgba(239,68,68,0.2)",
      text: "#f87171",
      iconBg: "linear-gradient(135deg, #ef4444, #dc2626)",
    },
    amber: {
      glow: "rgba(245,158,11,0.2)",
      gradient: "linear-gradient(135deg, rgba(245,158,11,0.12), rgba(245,158,11,0.05))",
      border: "rgba(245,158,11,0.2)",
      text: "#fbbf24",
      iconBg: "linear-gradient(135deg, #f59e0b, #d97706)",
    },
    blue: {
      glow: "rgba(59,130,246,0.2)",
      gradient: "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(59,130,246,0.05))",
      border: "rgba(59,130,246,0.2)",
      text: "#60a5fa",
      iconBg: "linear-gradient(135deg, #3b82f6, #2563eb)",
    },
  };

  const c = colorMap[color];

  return (
    <div
      className="rounded-xl p-5 animate-fade-in relative overflow-hidden"
      style={{
        background: c.gradient,
        border: `1px solid ${c.border}`,
        boxShadow: `0 4px 24px ${c.glow}`,
      }}
    >
      {/* Background decoration */}
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10"
        style={{ background: c.iconBg }} />

      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">{title}</p>
          <p className="text-3xl font-bold text-white mt-1">
            {value ?? <span className="text-gray-500 text-lg">—</span>}
          </p>
          {trend && (
            <p className="text-xs mt-2 font-medium" style={{ color: c.text }}>
              {trend}
            </p>
          )}
        </div>
        <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: c.iconBg, boxShadow: `0 0 14px ${c.glow}` }}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
