import React from 'react';
import { Ad } from '../types';
import { X, ExternalLink, ThumbsUp, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';
import { STATUS_COLORS } from '../constants';

interface AdCreativeGalleryProps {
  ads: Ad[];
  isLoading: boolean;
  adSetName: string;
  onClose: () => void;
}

const AdCreativeGallery: React.FC<AdCreativeGalleryProps> = ({ ads, isLoading, adSetName, onClose }) => {
  
  const handleContentClick = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-gray-100 rounded-xl shadow-2xl w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden"
        onClick={handleContentClick}
      >
        <div className="bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Ad Creatives</h2>
            <p className="text-sm text-gray-500">Ad Set: <span className="font-medium">{adSetName}</span></p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : ads.length === 0 ? (
            <div className="text-center py-20 text-gray-500">No creatives found for this ad set.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {ads.map((ad) => (
                <div key={ad.id} className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden">
                  {/* Performance Header */}
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex justify-between items-center text-xs">
                    <span className={`px-2 py-0.5 rounded-full border ${STATUS_COLORS[ad.status] || 'bg-gray-100'}`}>
                      {ad.status}
                    </span>
                    <span className="font-medium text-gray-700">CTR: {ad.ctr.toFixed(2)}%</span>
                  </div>

                  {/* Facebook Feed Simulation */}
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0"></div>
                      <div className="flex-1">
                        <div className="h-2.5 bg-gray-200 rounded w-24 mb-1"></div>
                        <div className="h-2 bg-gray-100 rounded w-16"></div>
                      </div>
                      <MoreHorizontal className="w-4 h-4 text-gray-400" />
                    </div>

                    <p className="text-sm text-gray-800 mb-3 line-clamp-3">{ad.creative.body}</p>

                    <div className="relative -mx-4 mb-2 bg-gray-100 aspect-video overflow-hidden">
                      <img 
                        src={ad.creative.image_url} 
                        alt="Ad Creative" 
                        className="w-full h-full object-cover" 
                      />
                    </div>

                    <div className="bg-gray-50 -mx-4 px-4 py-2 border-b border-gray-100 flex justify-between items-center mb-2">
                       <div>
                         <p className="text-xs font-bold text-gray-500 uppercase">example.com</p>
                         <p className="text-sm font-bold text-gray-900 truncate w-32">{ad.creative.title}</p>
                       </div>
                       <button className="px-3 py-1 bg-gray-200 text-gray-700 text-xs font-semibold rounded hover:bg-gray-300">
                         {ad.creative.call_to_action.replace('_', ' ')}
                       </button>
                    </div>

                    {/* Fake Social Proof */}
                    <div className="flex justify-between text-gray-400 text-xs mt-auto pt-2 border-t border-gray-50">
                      <div className="flex items-center gap-1">
                         <ThumbsUp className="w-3 h-3" /> <span>{Math.floor(Math.random() * 500)}</span>
                      </div>
                      <div className="flex gap-3">
                        <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3"/> 12</span>
                        <span className="flex items-center gap-1"><Share2 className="w-3 h-3"/> 4</span>
                      </div>
                    </div>
                  </div>

                  {/* Metrics Footer */}
                  <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-gray-500 block">Spend</span>
                      <span className="font-semibold text-gray-900">${ad.spend.toFixed(2)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-gray-500 block">CPC</span>
                      <span className="font-semibold text-gray-900">${ad.cpc.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdCreativeGallery;