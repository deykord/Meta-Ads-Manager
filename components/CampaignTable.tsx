import React from 'react';
import { Campaign, SortField, SortState } from '../types';
import { ArrowUpDown, ArrowUp, ArrowDown, ExternalLink } from 'lucide-react';
import { STATUS_COLORS } from '../constants';

interface CampaignTableProps {
  campaigns: Campaign[];
  sort: SortState;
  onSort: (field: SortField) => void;
  isLoading: boolean;
  onViewAdSets: (campaign: Campaign) => void;
}

const CampaignTable: React.FC<CampaignTableProps> = ({ campaigns, sort, onSort, isLoading, onViewAdSets }) => {
  const headers: { label: string; field: SortField; align: 'left' | 'right' }[] = [
    { label: 'Campaign Name', field: 'name', align: 'left' },
    { label: 'Status', field: 'status', align: 'left' },
    { label: 'Spend', field: 'spend', align: 'right' },
    { label: 'Impr.', field: 'impressions', align: 'right' },
    { label: 'Clicks', field: 'clicks', align: 'right' },
    { label: 'CTR', field: 'ctr', align: 'right' },
    { label: 'CPC', field: 'cpc', align: 'right' },
    { label: 'Conv.', field: 'conversions', align: 'right' },
  ];

  const renderSortIcon = (field: SortField) => {
    if (sort.field !== field) return <ArrowUpDown className="w-3 h-3 text-gray-400 ml-1" />;
    return sort.direction === 'asc' 
      ? <ArrowUp className="w-3 h-3 text-blue-600 ml-1" />
      : <ArrowDown className="w-3 h-3 text-blue-600 ml-1" />;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {headers.map((header) => (
                <th 
                  key={header.field}
                  className={`px-6 py-4 font-semibold text-gray-700 select-none cursor-pointer hover:bg-gray-100 transition-colors ${header.align === 'right' ? 'text-right' : 'text-left'}`}
                  onClick={() => onSort(header.field)}
                >
                  <div className={`flex items-center ${header.align === 'right' ? 'justify-end' : 'justify-start'}`}>
                    {header.label}
                    {renderSortIcon(header.field)}
                  </div>
                </th>
              ))}
              <th className="px-6 py-4 font-semibold text-gray-700 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              // Loading Skeleton
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-48"></div></td>
                  <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded-full w-20"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16 ml-auto"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16 ml-auto"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-12 ml-auto"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-12 ml-auto"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-12 ml-auto"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-10 ml-auto"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-8 mx-auto"></div></td>
                </tr>
              ))
            ) : campaigns.length === 0 ? (
               <tr>
                <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                  No campaigns found matching your filters.
                </td>
              </tr>
            ) : (
              campaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    <div className="flex flex-col">
                      <span>{campaign.name}</span>
                      <span className="text-xs text-gray-400 mt-1">{campaign.id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[campaign.status] || 'bg-gray-100'}`}>
                      {campaign.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-gray-700 tabular-nums">
                    ${campaign.spend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-700 tabular-nums">
                    {campaign.impressions.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-700 tabular-nums">
                    {campaign.clicks.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-700 tabular-nums">
                    {campaign.ctr.toFixed(2)}%
                  </td>
                  <td className="px-6 py-4 text-right text-gray-700 tabular-nums">
                    ${campaign.cpc.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-700 tabular-nums font-medium">
                    {campaign.conversions.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => onViewAdSets(campaign)}
                      className="text-gray-400 hover:text-blue-600 transition-colors p-1 rounded hover:bg-blue-50" 
                      title="View Ad Sets"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
        <span className="text-sm text-gray-500">
          Showing {campaigns.length} campaigns
        </span>
        {/* Pagination Controls Would Go Here (Simplified for demo) */}
      </div>
    </div>
  );
};

export default CampaignTable;