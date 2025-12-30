import React, { useState, useEffect, useCallback } from 'react';
import { Campaign, AdSet, Ad, FilterState, SortState, SortField } from './types';
import { getCampaigns, getAdSets, getAds, fetchCampaignsFromMeta, fetchAdSetsFromMeta, exportData } from './services/api';
import MetricsCards from './components/MetricsCards';
import DashboardCharts from './components/DashboardCharts';
import DemographicsCharts from './components/DemographicsCharts';
import CampaignTable from './components/CampaignTable';
import AdSetTable from './components/AdSetTable';
import AdCreativeGallery from './components/AdCreativeGallery';
import CompetitorSpy from './components/CompetitorSpy';
import { LayoutDashboard, RefreshCw, Download, Filter, Search, Calendar, Database, Globe, BarChart2 } from 'lucide-react';

type ViewMode = 'dashboard' | 'competitor';

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [syncingAdSets, setSyncingAdSets] = useState<boolean>(false);
  
  // Ad Set Modal State
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [adSets, setAdSets] = useState<AdSet[]>([]);
  const [loadingAdSets, setLoadingAdSets] = useState<boolean>(false);

  // Ad Creative Modal State
  const [selectedAdSet, setSelectedAdSet] = useState<AdSet | null>(null);
  const [ads, setAds] = useState<Ad[]>([]);
  const [loadingAds, setLoadingAds] = useState<boolean>(false);
  
  // Filters State
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: 'ALL',
    dateRange: { startDate: '', endDate: '' }
  });

  // Sorting State
  const [sort, setSort] = useState<SortState>({
    field: 'spend',
    direction: 'desc'
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getCampaigns(filters, sort);
      setCampaigns(response.data);
    } catch (error) {
      console.error("Failed to load campaigns", error);
    } finally {
      setLoading(false);
    }
  }, [filters, sort]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchCampaignsFromMeta(); 
      await loadData();
    } finally {
      setRefreshing(false);
    }
  };

  const handleSyncAdSets = async () => {
    setSyncingAdSets(true);
    try {
      await fetchAdSetsFromMeta(); 
      await loadData();
    } finally {
      setSyncingAdSets(false);
    }
  };

  const handleSort = (field: SortField) => {
    setSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  // View Ad Sets Logic
  const handleViewAdSets = async (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setLoadingAdSets(true);
    try {
      const data = await getAdSets(campaign.id);
      setAdSets(data);
    } catch (error) {
      console.error("Failed to load ad sets", error);
    } finally {
      setLoadingAdSets(false);
    }
  };

  // View Ads Logic (Drill down from Ad Set)
  const handleViewCreatives = async (adSet: AdSet) => {
    setSelectedAdSet(adSet);
    setLoadingAds(true);
    try {
      const data = await getAds(adSet.id);
      setAds(data);
    } catch (error) {
      console.error("Failed to load ads", error);
    } finally {
      setLoadingAds(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-10 font-sans">
      {/* Header / Nav */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500">
                Meta Ads Manager Pro
              </h1>
            </div>

            {/* View Switcher */}
            <nav className="hidden md:flex bg-gray-100 p-1 rounded-lg">
               <button 
                onClick={() => setViewMode('dashboard')}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === 'dashboard' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
               >
                 Dashboard
               </button>
               <button 
                onClick={() => setViewMode('competitor')}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-1 ${viewMode === 'competitor' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
               >
                 <Globe className="w-3 h-3" /> Competitor Spy
               </button>
            </nav>
          </div>

          <div className="flex items-center gap-3">
             {viewMode === 'dashboard' && (
              <>
                 <div className="hidden lg:flex items-center gap-1 text-sm text-gray-500 mr-2 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                    <Database className="w-3 h-3" />
                    <span>PostgreSQL</span>
                 </div>
                 <button 
                  onClick={handleSyncAdSets}
                  disabled={syncingAdSets}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border ${syncingAdSets ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncingAdSets ? 'animate-spin' : ''}`} />
                  {syncingAdSets ? 'Syncing...' : 'Sync Sets'}
                </button>

                 <button 
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border ${refreshing ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing ? 'Refreshing...' : 'Refresh Data'}
                </button>
                <button 
                  onClick={() => exportData(campaigns, 'csv')}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export
                </button>
              </>
             )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {viewMode === 'dashboard' ? (
          <>
            <MetricsCards campaigns={campaigns} />
            <DashboardCharts campaigns={campaigns} />
            <DemographicsCharts />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex flex-1 items-center gap-4">
                 <div className="relative flex-1 max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search campaigns..."
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    />
                 </div>
                 <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Filter className="h-4 w-4 text-gray-400" />
                    </div>
                    <select
                      className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm bg-white cursor-pointer"
                      value={filters.status}
                      onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    >
                      <option value="ALL">All Status</option>
                      <option value="ACTIVE">Active</option>
                      <option value="PAUSED">Paused</option>
                      <option value="ARCHIVED">Archived</option>
                    </select>
                 </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" /> Last 30 Days
              </div>
            </div>

            <CampaignTable 
              campaigns={campaigns} 
              sort={sort} 
              onSort={handleSort}
              isLoading={loading}
              onViewAdSets={handleViewAdSets}
            />
          </>
        ) : (
          <CompetitorSpy />
        )}
        
        {/* Modals */}
        {selectedCampaign && (
          <AdSetTable 
            adSets={adSets}
            isLoading={loadingAdSets}
            campaignName={selectedCampaign.name}
            onClose={() => { setSelectedCampaign(null); setAdSets([]); }}
            onViewCreatives={handleViewCreatives}
          />
        )}

        {selectedAdSet && (
          <AdCreativeGallery
            ads={ads}
            isLoading={loadingAds}
            adSetName={selectedAdSet.name}
            onClose={() => { setSelectedAdSet(null); setAds([]); }}
          />
        )}
        
      </main>
    </div>
  );
}