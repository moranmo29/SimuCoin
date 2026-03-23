import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';

/**
 * Fixed footer banner that reminds users this is a simulation environment.
 * Always visible at the bottom of the viewport.
 */
export default function SimulationBanner() {
  const { t } = useTranslation();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-amber/10 border-t border-amber/20 backdrop-blur-sm">
      <div className="flex items-center justify-center gap-2 py-2 px-4">
        <AlertTriangle className="w-4 h-4 text-amber shrink-0" />
        <span className="text-xs text-amber font-medium">
          {t('banner.warning')}
        </span>
      </div>
    </div>
  );
}
