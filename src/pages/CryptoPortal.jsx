import { useTranslation } from 'react-i18next';
import { ExternalLink, Search, Blocks, BarChart3, Newspaper, Shield } from 'lucide-react';
import { portalLinks } from '../store/simulationData';

/**
 * Icon mapping for each portal category.
 */
const categoryIcons = {
  explorers: Blocks,
  data: BarChart3,
  news: Newspaper,
  tools: Shield,
};

/**
 * Color accent mapping for each portal category.
 */
const categoryColors = {
  explorers: { border: 'border-cyber/20', hover: 'hover:border-cyber/40', icon: 'text-cyber', bg: 'bg-cyber/5' },
  data: { border: 'border-emerald/20', hover: 'hover:border-emerald/40', icon: 'text-emerald', bg: 'bg-emerald/5' },
  news: { border: 'border-amber/20', hover: 'hover:border-amber/40', icon: 'text-amber', bg: 'bg-amber/5' },
  tools: { border: 'border-red/20', hover: 'hover:border-red/40', icon: 'text-red', bg: 'bg-red/5' },
};

/**
 * Crypto Portal page displaying curated links to blockchain resources.
 * Links are organized into categories: Explorers, Data, News, and Tools.
 */
export default function CryptoPortal() {
  const { t } = useTranslation();

  const categories = [
    { key: 'explorers', title: t('portal.explorers'), desc: t('portal.explorersDesc') },
    { key: 'data', title: t('portal.data'), desc: t('portal.dataDesc') },
    { key: 'news', title: t('portal.news'), desc: t('portal.newsDesc') },
    { key: 'tools', title: t('portal.tools'), desc: t('portal.toolsDesc') },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-white">{t('portal.title')}</h2>
        <p className="text-sm text-slate-500 mt-1">{t('portal.subtitle')}</p>
      </div>

      {/* Categories */}
      {categories.map(({ key, title, desc }) => {
        const CatIcon = categoryIcons[key];
        const colors = categoryColors[key];
        const links = portalLinks[key];

        return (
          <section key={key}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-9 h-9 rounded-lg ${colors.bg} flex items-center justify-center`}>
                <CatIcon className={`w-5 h-5 ${colors.icon}`} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">{title}</h3>
                <p className="text-xs text-slate-500">{desc}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {links.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group bg-slate-900 border ${colors.border} ${colors.hover} rounded-xl p-4 transition-all hover:shadow-lg flex flex-col`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{link.icon}</span>
                      <h4 className="text-sm font-semibold text-white group-hover:text-cyber transition-colors">
                        {link.name}
                      </h4>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition-colors shrink-0 mt-0.5" />
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed flex-1">{link.description}</p>
                  <div className="mt-3 pt-2 border-t border-slate-800">
                    <span className={`text-[11px] font-medium ${colors.icon} flex items-center gap-1`}>
                      {t('portal.visitSite')} <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
