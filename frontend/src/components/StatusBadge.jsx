// src/components/StatusBadge.jsx

const dots = {
  success: "bg-emerald-400",
  failed: "bg-red-400",
  pending: "bg-amber-400",
};

const StatusBadge = ({ status }) => {
  const s = status?.toLowerCase();

  const badgeClass =
    s === "success" ? "badge-success" :
    s === "failed"  ? "badge-failed"  :
                      "badge-pending";

  return (
    <span className={badgeClass}>
      <span className={`w-1.5 h-1.5 rounded-full ${dots[s] || "bg-gray-400"}`} />
      {status}
    </span>
  );
};

export default StatusBadge;
