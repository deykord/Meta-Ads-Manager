import React, { useState } from 'react';
import { CompetitorAd } from '../types';
import { searchCompetitorAds } from '../services/api';
import { Search, Globe, Calendar, Layout } from 'lucide-react';

const CompetitorSpy: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [ads, setAds] = useState<CompetitorAd[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    setSearched(true);
    try {
      const results = await searchCompetitorAds(searchTerm);
      setAds(results);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[600px]">
      <div className="p-8 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-blue-50">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Competitor Intelligence</h2>
          <p className="text-gray-600 mb-6">Search for any brand to see their active ad creatives using the Meta Ad Library API.</p>
          
          <form onSubmit={handleSearch} className="relative flex items-center">
            <input 
              type="text" 
              placeholder="Enter a competitor's page name (e.g. 'Nike', 'HubSpot')"
              className="w-full pl-5 pr-14 py-4 rounded-full border-0 shadow-md ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button 
              type="submit"
              className="absolute right-2 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
              disabled={loading}
            >
              <Search className="w-6 h-6" />
            </button>
          </form>
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-500">Searching Ad Library...</p>
          </div>
        ) : !searched ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
             <Layout className="w-16 h-16 mb-4 opacity-20" />
             <p>Enter a brand name above to start spying.</p>
          </div>
        ) : ads.length === 0 ? (
          <div className="text-center py-20 text-gray-500">No ads found for "{searchTerm}".</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ads.map((ad) => (
              <div key={ad.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="p-4 flex items-center gap-3 border-b border-gray-100">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0"></div>
                  <div>
                    <h3 className="font-bold text-sm text-gray-900">{ad.page_name}</h3>
                    <p className="text-xs text-gray-500">Sponsored</p>
                  </div>
                </div>
                
                <div className="p-4">
                  <p className="text-sm text-gray-800 mb-3 line-clamp-4">{ad.body}</p>
                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-3">
                    <img src={ad.ad_snapshot_url} alt="Ad Creative" className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-50">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>Started {ad.started_date}</span>
                    </div>
                    <div className="flex gap-2">
                      {ad.platforms.map(p => (
                         <span key={p} className="capitalize bg-gray-100 px-1.5 py-0.5 rounded">{p}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompetitorSpy;