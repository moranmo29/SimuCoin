/**
 * A metric card displaying a label, value, and optional icon.
 * Used on the dashboard for network statistics.
 * @param {Object} props
 * @param {string} props.label - Metric label text
 * @param {string|number} props.value - Metric value
 * @param {React.ComponentType} [props.icon] - Optional Lucide icon component
 * @param {string} [props.accent] - Tailwind color class for the accent
 */
export default function StatCard({ label, value, icon: Icon, accent = 'text-cyber' }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-500 uppercase tracking-wider">{label}</span>
        {Icon && <Icon className={`w-4 h-4 ${accent}`} />}
      </div>
      <p className={`text-xl font-semibold font-mono ${accent}`}>{value}</p>
    </div>
  );
}
