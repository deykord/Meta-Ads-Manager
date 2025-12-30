import React from 'react';
import { AdSet } from '../types';
import { X, AlertCircle, Layers, MapPin, Users, Hash, Eye, MonitorPlay } from 'lucide-react';
import { STATUS_COLORS } from '../constants';

interface AdSetTableProps {
  adSets: AdSet[];
  isLoading: boolean;
  campaignName: string;
  onClose: () => void;
  onViewCreatives: (adSet: AdSet) => void;
}

const AdSetTable: React.FC<AdSetTableProps> = ({ adSets, isLoading, campaignName, onClose, onViewCreatives }) => {
  const handleContentClick = (e: React.MouseEvent) => e.stopPropagation();

  // Helper to format targeting text
  const renderTargeting = (t: AdSet['targeting']) => (
    <div className="text-xs text-gray-500 space-y-1">
      <div className="flex items-center gap-1"><MapPin className="w-3 h-3"/> {t.geo_locations.countries.join(', ')}</div>
      <div className="flex items-center gap-1"><Users className="w-3 h-3"/> {t.age_min}-{t.age_max} • {t.genders.length === 2 ? 'All' : (t.genders[0] === 1 ? 'F' : 'M')}</div>
      {t.interests && t.interests.length > 0 && (
        <div className="flex items-center gap-1"><Hash className="w-3 h-3"/> {t.interests.slice(0, 2).join(', ')}{t.interests.length > 2 && '...'}</div>
      )}
    </div>
  );

  return (
    <div 
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-7xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={handleContentClick}
      >
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Layers className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Ad Sets</h2>
              <p className="text-sm text-gray-500">Campaign: <span className="font-medium text-gray-700">{campaignName}</span></p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-auto custom-scrollbar p-0">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-6 py-3 font-semibold text-gray-700">Name & ID</th>
                <th className="px-6 py-3 font-semibold text-gray-700">Targeting</th>
                <th className="px-6 py-3 font-semibold text-gray-700">Status</th>
                <th className="px-6 py-3 font-semibold text-gray-700 text-right">Budget</th>
                <th className="px-6 py-3 font-semibold text-gray-700 text-right">Spend</th>
                <th className="px-6 py-3 font-semibold text-gray-700 text-right">CTR</th>
                <th className="px-6 py-3 font-semibold text-gray-700 text-right">Conv.</th>
                <th className="px-6 py-3 font-semibold text-gray-700 text-center">Creatives</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                    <td className="px-6 py-4"><div className="h-8 bg-gray-200 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded-full w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16 ml-auto"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16 ml-auto"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-12 ml-auto"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-10 ml-auto"></div></td>
                    <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded w-12 mx-auto"></div></td>
                  </tr>
                ))
              ) : adSets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500 bg-white">
                    <div className="flex flex-col items-center justify-center">
                      <AlertCircle className="w-10 h-10 text-gray-300 mb-2" />
                      <p>No ad sets found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                adSets.map((adSet) => (
                  <tr key={adSet.id} className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      <div className="flex flex-col">
                        <span>{adSet.name}</span>
                        <span className="text-xs text-gray-400 mt-0.5">{adSet.id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {adSet.targeting ? renderTargeting(adSet.targeting) : <span className="text-gray-400">-</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[adSet.status] || 'bg-gray-100'}`}>
                        {adSet.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-gray-700 tabular-nums">
                      {adSet.daily_budget ? `$${adSet.daily_budget.toLocaleString()}` : '-'}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-700 tabular-nums">
                      ${adSet.spend.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-700 tabular-nums">
                      {adSet.ctr.toFixed(2)}%
                    </td>
                    <td className="px-6 py-4 text-right text-gray-700 tabular-nums font-medium text-green-600">
                      {adSet.conversions.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                       <button 
                         onClick={() => onViewCreatives(adSet)}
                         className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 transition-colors"
                       >
                         <MonitorPlay className="w-3 h-3" /> View Ads
                       </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdSetTable;