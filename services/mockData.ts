import { Campaign, AdSet, Ad, Targeting, CompetitorAd } from '../types';

const generateRandomId = () => Math.random().toString(36).substring(2, 11).toUpperCase();
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min);
const randomFloat = (min: number, max: number) => parseFloat((Math.random() * (max - min) + min).toFixed(2));

const CAMPAIGN_NAMES = [
  "Summer Sale 2024 - Conversions",
  "Q3 Brand Awareness",
  "Retargeting - Cart Abandoners",
  "Lookalike 1% - High LTV",
  "New User Acquisition - Video",
  "Holiday Special - Catalog Sales",
  "Lead Gen - Ebook Download",
  "Traffic - Blog Content",
  "App Install - iOS",
  "Re-engagement - Inactive Users"
];

const AD_TITLES = [
  "Don't Miss Out on Summer Savings! ☀️",
  "The Ultimate Solution for Growth 🚀",
  "Unlock Your Potential Today",
  "Limited Time Offer: 50% OFF",
  "Join 10,000+ Happy Customers",
  "Stop Guessing, Start Scaling",
  "Your New Favorite Tool"
];

const AD_BODIES = [
  "Experience the difference with our premium service. Sign up today and get a free consultation.",
  "Are you tired of manual work? Automate your workflow instantly.",
  "We help businesses scale faster than ever before. Click to learn our secrets.",
  "Last chance to grab this deal! Offer ends at midnight.",
  "See why industry leaders trust us for their marketing needs."
];

const IMAGES = [
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80"
];

export const generateMockCampaigns = (count: number): Campaign[] => {
  return Array.from({ length: count }).map((_, index) => {
    const name = CAMPAIGN_NAMES[index % CAMPAIGN_NAMES.length] + ` ${index + 1}`;
    const spend = randomFloat(500, 50000);
    const impressions = Math.floor(spend * randomFloat(20, 100));
    const clicks = Math.floor(impressions * randomFloat(0.005, 0.03));
    const conversions = Math.floor(clicks * randomFloat(0.02, 0.15));
    
    return {
      id: `CAM-${generateRandomId()}`,
      name: name,
      status: Math.random() > 0.3 ? 'ACTIVE' : (Math.random() > 0.5 ? 'PAUSED' : 'ARCHIVED'),
      objective: ['CONVERSIONS', 'OUTCOME_TRAFFIC', 'BRAND_AWARENESS'][randomInt(0, 2)],
      buying_type: 'AUCTION',
      fetched_at: new Date().toISOString(),
      spend: spend,
      impressions: impressions,
      clicks: clicks,
      conversions: conversions,
      ctr: (clicks / impressions) * 100,
      cpc: spend / clicks,
      cpm: (spend / impressions) * 1000
    };
  });
};

const generateTargeting = (): Targeting => {
  return {
    age_min: randomInt(18, 25),
    age_max: randomInt(45, 65),
    genders: Math.random() > 0.7 ? [1, 2] : (Math.random() > 0.5 ? [1] : [2]),
    geo_locations: {
      countries: ['US', 'CA', 'GB', 'AU'].sort(() => 0.5 - Math.random()).slice(0, randomInt(1, 3)),
      cities: Math.random() > 0.5 ? ['New York', 'Los Angeles'] : undefined
    },
    interests: ['Marketing', 'Small Business', 'Technology', 'Fitness', 'Travel'].sort(() => 0.5 - Math.random()).slice(0, randomInt(1, 4))
  };
};

export const generateMockAdSets = (campaignId: string, count: number): AdSet[] => {
  return Array.from({ length: count }).map((_, index) => {
    const spend = randomFloat(100, 5000);
    const impressions = Math.floor(spend * randomFloat(20, 100));
    const clicks = Math.floor(impressions * randomFloat(0.01, 0.04));
    const ctr = (clicks / impressions) * 100;
    const cpc = clicks > 0 ? spend / clicks : 0;
    
    return {
      id: `ADSET-${generateRandomId()}`,
      campaign_id: campaignId,
      name: `Ad Set ${String.fromCharCode(65 + index)} - ${['Broad', 'Interest', 'LAL'][index % 3]}`,
      status: Math.random() > 0.2 ? 'ACTIVE' : 'PAUSED',
      daily_budget: randomInt(20, 200),
      start_time: new Date(Date.now() - randomInt(1, 30) * 86400000).toISOString(),
      targeting: generateTargeting(),
      spend: spend,
      impressions: impressions,
      clicks: clicks,
      conversions: Math.floor(clicks * randomFloat(0.05, 0.2)),
      ctr: ctr,
      cpc: cpc
    };
  });
};

export const generateMockAds = (adSetId: string, count: number): Ad[] => {
  return Array.from({ length: count }).map((_, index) => {
    const spend = randomFloat(50, 1000);
    const impressions = Math.floor(spend * randomFloat(20, 100));
    const clicks = Math.floor(impressions * randomFloat(0.01, 0.03));
    
    return {
      id: `AD-${generateRandomId()}`,
      adset_id: adSetId,
      name: `Ad Variant ${index + 1}`,
      status: Math.random() > 0.1 ? 'ACTIVE' : 'PAUSED',
      creative: {
        id: `CREATIVE-${generateRandomId()}`,
        title: AD_TITLES[randomInt(0, AD_TITLES.length - 1)],
        body: AD_BODIES[randomInt(0, AD_BODIES.length - 1)],
        image_url: IMAGES[index % IMAGES.length],
        call_to_action: ['LEARN_MORE', 'SIGN_UP', 'SHOP_NOW'][randomInt(0, 2)],
        link_url: 'https://example.com/landing-page'
      },
      spend,
      impressions,
      clicks,
      conversions: Math.floor(clicks * randomFloat(0.02, 0.1)),
      ctr: (clicks / impressions) * 100,
      cpc: clicks > 0 ? spend / clicks : 0,
    };
  });
};

export const generateCompetitorAds = (pageName: string): CompetitorAd[] => {
  return Array.from({ length: 6 }).map((_, i) => ({
    id: `COMP-${generateRandomId()}`,
    page_name: pageName,
    page_profile_picture_url: "https://via.placeholder.com/50",
    ad_snapshot_url: IMAGES[i % IMAGES.length],
    body: AD_BODIES[i % AD_BODIES.length],
    platforms: ['facebook', 'instagram', 'audience_network'].slice(0, randomInt(1, 3)),
    started_date: new Date(Date.now() - randomInt(1, 20) * 86400000).toLocaleDateString()
  }));
};