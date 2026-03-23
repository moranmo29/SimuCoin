import { useState, useRef, useEffect } from 'react';
import { HelpCircle, X } from 'lucide-react';

/**
 * Educational tooltip component for technical blockchain terms.
 * Renders a (?) icon that opens a popover with a plain-language explanation.
 * Part of the "Explore Mode" overlay system.
 * @param {Object} props
 * @param {string} props.term - The technical term being explained
 * @param {string} props.explanation - Plain-language explanation text
 * @param {string} [props.size] - Icon size class (default: 'w-3.5 h-3.5')
 */
export default function HelpTooltip({ term, explanation, size = 'w-3.5 h-3.5' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  /** Close tooltip when clicking outside. */
  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <span className="relative inline-flex items-center" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="text-slate-600 hover:text-cyber transition-colors cursor-help ml-1"
        aria-label={`Explain: ${term}`}
      >
        <HelpCircle className={size} />
      </button>

      {open && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-3 animate-in fade-in">
          <div className="flex items-start justify-between gap-2 mb-1">
            <span className="text-xs font-semibold text-cyber">{term}</span>
            <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-slate-300">
              <X className="w-3 h-3" />
            </button>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">{explanation}</p>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 border-r border-b border-slate-700 rotate-45 -mt-1" />
        </div>
      )}
    </span>
  );
}
