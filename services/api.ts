import { Campaign, AdSet, Ad, CompetitorAd, FilterState, SortState } from '../types';
import { generateMockCampaigns, generateMockAdSets, generateMockAds, generateCompetitorAds } from './mockData';
import { API_DELAY_MS } from '../constants';

// CONFIGURATION
const USE_REAL_API = false; 
const API_BASE_URL = 'http://localhost:3001/api';

// --- MOCK STATE ---
let cachedCampaigns: Campaign[] = generateMockCampaigns(25);
let cachedAdSets: AdSet[] = cachedCampaigns.flatMap(c => generateMockAdSets(c.id, 3));
// Cache ads lazily in a map: AdSetId -> Ad[]
let cachedAds: Map<string, Ad[]> = new Map();

/**
 * Trigger data sync from Meta Marketing API
 */
export const fetchCampaignsFromMeta = async (): Promise<any> => {
  if (USE_REAL_API) {
    try {
      const response = await fetch(`${API_BASE_URL}/fetch-campaigns`, {
        method: 'POST',
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to sync campaigns:', error);
      return { success: false, error: 'Network error during sync' };
    }
  }
  return new Promise((resolve) => {
    setTimeout(() => {
      const newData = generateMockCampaigns(25);
      cachedCampaigns = newData; 
      cachedAdSets = newData.flatMap(c => generateMockAdSets(c.id, 3));
      cachedAds.clear();
      resolve({ success: true, message: 'Mock Sync Complete' });
    }, API_DELAY_MS * 2);
  });
};

/**
 * Trigger Ad Set sync
 */
export const fetchAdSetsFromMeta = async (campaignIds?: string[]): Promise<any> => {
  if (USE_REAL_API) {
    try {
      const response = await fetch(`${API_BASE_URL}/fetch-adsets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaign_ids: campaignIds || [] })
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to sync ad sets:', error);
      return { success: false, error: 'Network error during sync' };
    }
  }

  return new Promise((resolve) => {
    setTimeout(() => {
      // Refresh mock data
      cachedAdSets = cachedCampaigns.flatMap(c => generateMockAdSets(c.id, 3));
      resolve({ success: true, message: 'Mock AdSet Sync Complete' });
    }, API_DELAY_MS * 2);
  });
};

/**
 * Get Campaigns
 */
export const getCampaigns = async (
  filters: FilterState,
  sort: SortState
): Promise<{ data: Campaign[], total: number }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let result = [...cachedCampaigns];

      if (filters.search) {
        const q = filters.search.toLowerCase();
        result = result.filter(c => 
          c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q)
        );
      }
      
      if (filters.status && filters.status !== 'ALL') {
        result = result.filter(c => c.status === filters.status);
      }

      result.sort((a, b) => {
        const valA = a[sort.field];
        const valB = b[sort.field];
        if (typeof valA === 'string' && typeof valB === 'string') {
           return sort.direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        // @ts-ignore
        return sort.direction === 'asc' ? valA - valB : valB - valA;
      });

      resolve({ data: result, total: result.length });
    }, API_DELAY_MS);
  });
};

/**
 * Get Ad Sets
 */
export const getAdSets = async (campaignId?: string): Promise<AdSet[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (campaignId) {
        resolve(cachedAdSets.filter(a => a.campaign_id === campaignId));
      } else {
        resolve(cachedAdSets);
      }
    }, API_DELAY_MS);
  });
};

/**
 * Get Ads for an Ad Set (New)
 */
export const getAds = async (adSetId: string): Promise<Ad[]> => {
  if (USE_REAL_API) {
    // fetch(`${API_BASE_URL}/ads?adset_id=${adSetId}`)
  }

  return new Promise((resolve) => {
    setTimeout(() => {
      if (!cachedAds.has(adSetId)) {
        cachedAds.set(adSetId, generateMockAds(adSetId, 4));
      }
      resolve(cachedAds.get(adSetId) || []);
    }, API_DELAY_MS);
  });
};

/**
 * Search Competitor Ads (Meta Ad Library Mock)
 */
export const searchCompetitorAds = async (pageName: string): Promise<CompetitorAd[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(generateCompetitorAds(pageName));
    }, API_DELAY_MS * 1.5);
  });
};

/**
 * Client-side export helper
 */
export const exportData = (campaigns: Campaign[], format: 'csv' | 'xlsx') => {
  if (format === 'csv') {
    const headers = ['ID', 'Name', 'Status', 'Spend', 'Impressions', 'Clicks', 'CTR', 'CPC', 'Conversions'];
    const rows = campaigns.map(c => [
      c.id, `"${c.name}"`, c.status, c.spend.toFixed(2), c.impressions, c.clicks, c.ctr.toFixed(2) + '%', c.cpc.toFixed(2), c.conversions
    ]);
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `campaign_export.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
};