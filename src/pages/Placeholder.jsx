import { useTranslation } from 'react-i18next';
import { Construction } from 'lucide-react';

/**
 * Placeholder page for screens not yet implemented.
 * @param {Object} props
 * @param {string} props.titleKey - i18n translation key for the page title
 */
export default function Placeholder({ titleKey }) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <Construction className="w-16 h-16 text-slate-700 mb-4" />
      <h2 className="text-xl font-semibold text-white mb-2">{t(`nav.${titleKey}`)}</h2>
      <p className="text-sm text-slate-500 max-w-md">
        This module is under construction. Complete the current review before proceeding to this phase.
      </p>
    </div>
  );
}
