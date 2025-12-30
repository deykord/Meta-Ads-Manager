// Data Models matching the Database Schema
export interface Campaign {
  id: string;
  name: string;
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED' | 'ADSET_PAUSED';
  objective: string;
  buying_type: string;
  fetched_at: string;
  // Aggregated metrics
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpc: number;
  cpm: number;
}

export interface Targeting {
  age_min: number;
  age_max: number;
  genders: number[]; // 1=F, 2=M
  geo_locations: {
    countries: string[];
    cities?: string[];
  };
  interests?: string[];
}

export interface AdSet {
  id: string;
  campaign_id: string;
  name: string;
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
  daily_budget: number;
  start_time: string;
  end_time?: string;
  targeting: Targeting; // Structured object
  // Metrics
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpc: number;
}

export interface AdCreative {
  id: string;
  title: string;
  body: string;
  image_url: string;
  call_to_action: string;
  link_url: string;
}

export interface Ad {
  id: string;
  adset_id: string;
  name: string;
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED' | 'REJECTED';
  creative: AdCreative;
  // Metrics
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpc: number;
}

export interface CompetitorAd {
  id: string;
  page_name: string;
  page_profile_picture_url: string;
  ad_snapshot_url: string; // The "creative"
  started_date: string;
  platforms: string[];
  body: string;
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface FilterState {
  search: string;
  status: string;
  dateRange: DateRange;
}

export type SortField = 'name' | 'spend' | 'impressions' | 'clicks' | 'ctr' | 'conversions' | 'status' | 'cpc' | 'cpm';
export type SortDirection = 'asc' | 'desc';

export interface SortState {
  field: SortField;
  direction: SortDirection;
}

// Interface for the backend reference code
export interface MetaApiConfig {
  appId: string;
  appSecret: string;
  accessToken: string;
  adAccountId: string;
}