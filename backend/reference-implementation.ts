/**
 * BACKEND REFERENCE IMPLEMENTATION
 * 
 * This file demonstrates how to implement the backend using Node.js/Express.
 * 
 * Dependencies to install: 
 * npm install express @prisma/client facebook-nodejs-business-sdk node-fetch
 */

/*
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { FacebookAdsApi, AdAccount } from 'facebook-nodejs-business-sdk';

const router = express.Router();
const prisma = new PrismaClient();

// Configuration
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const AD_ACCOUNT_ID = process.env.AD_ACCOUNT_ID; // 'act_<ID>'

if (ACCESS_TOKEN) {
  FacebookAdsApi.init(ACCESS_TOKEN);
}

// GET /api/competitor-search
// Searches the Meta Ad Library for active ads by a specific brand/page.
// 
// Rate Limit Note: The Ad Library API has strict rate limits. 
// Ensure you handle 429 errors or Error Code 17/613 gracefully.
router.get('/competitor-search', async (req, res) => {
  const { q } = req.query;

  // 1. Validation
  if (!q || typeof q !== 'string') {
    return res.status(400).json({ error: 'Query parameter "q" (brand name) is required.' });
  }

  try {
    // 2. Prepare Graph API Request
    const baseUrl = 'https://graph.facebook.com/v19.0/ads_archive';
    
    // Fields to request from Ad Library
    const fields = [
      'id',
      'page_id',
      'page_name',
      'ad_snapshot_url',      // The link to the ad preview
      'ad_delivery_start_time',
      'ad_creative_bodies',   // The text copy of the ad
      'publisher_platforms'   // e.g., facebook, instagram
    ].join(',');

    const params = new URLSearchParams({
      search_terms: q,
      ad_active_status: 'ACTIVE',
      ad_reached_countries: "['US']", // Required when searching active ads
      fields: fields,
      limit: '24', // Fetch enough to fill the grid
      access_token: ACCESS_TOKEN || ''
    });

    // 3. Execute Request
    const response = await fetch(`${baseUrl}?${params.toString()}`);
    
    // 4. Handle API Errors & Rate Limits
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Meta Ad Library API Error:', errorData);

      // Check for Rate Limit codes (17 = User request limit, 613 = Rate limit)
      if (response.status === 429 || errorData.error?.code === 17 || errorData.error?.code === 613) {
        return res.status(429).json({ 
          error: 'Meta API rate limit exceeded. Please try again in a few minutes.' 
        });
      }

      return res.status(response.status).json({ 
        error: errorData.error?.message || 'Failed to fetch competitor ads from Meta.' 
      });
    }

    const data = await response.json();

    // 5. Transform Data for Frontend
    // Map raw Graph API response to our app's CompetitorAd interface
    const formattedAds = data.data.map((item: any) => ({
      id: item.id,
      page_name: item.page_name,
      // Construct profile picture URL using Page ID (Standard Graph API pattern)
      page_profile_picture_url: `https://graph.facebook.com/${item.page_id}/picture?type=square&access_token=${ACCESS_TOKEN}`, 
      ad_snapshot_url: item.ad_snapshot_url,
      started_date: item.ad_delivery_start_time,
      platforms: item.publisher_platforms || [],
      // Use the first body text available, or a fallback
      body: item.ad_creative_bodies && item.ad_creative_bodies.length > 0 
        ? item.ad_creative_bodies[0] 
        : 'No text content available'
    }));

    res.json({ data: formattedAds });

  } catch (error) {
    console.error('Server Error during Competitor Search:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/fetch-adsets
// Fetches Ad Sets from Meta Marketing API (with metrics) and updates the database.
router.post('/fetch-adsets', async (req, res) => {
  const { campaign_ids } = req.body;

  try {
    const account = new AdAccount(AD_ACCOUNT_ID);

    // Fields to fetch: including daily_budget and insights
    const fields = [
      'id',
      'name',
      'status',
      'daily_budget',
      'start_time',
      'end_time',
      'campaign_id',
      'targeting',
      'insights.date_preset(maximum){spend,impressions,clicks,ctr,cpc,conversions}'
    ];

    const params: Record<string, any> = {
      limit: 50,
    };

    // Optional: Filter by specific campaigns if provided
    if (campaign_ids && Array.isArray(campaign_ids) && campaign_ids.length > 0) {
      params.filtering = [{ field: 'campaign.id', operator: 'IN', value: campaign_ids }];
    }

    console.log(`Starting AdSet Sync for account ${AD_ACCOUNT_ID}...`);

    let adSets = await account.getAdSets(fields, params);
    let totalProcessed = 0;

    const processBatch = async (adSetList: any[]) => {
       await prisma.$transaction(async (tx) => {
         for (const adSet of adSetList) {
           const insights = adSet.insights?.[0] || {};
           
           await tx.adSet.upsert({
             where: { id: adSet.id },
             update: {
                name: adSet.name,
                status: adSet.status,
                daily_budget: adSet.daily_budget ? parseInt(adSet.daily_budget) : null,
                // metrics update
                spend: parseFloat(insights.spend || 0),
                impressions: parseInt(insights.impressions || 0),
                clicks: parseInt(insights.clicks || 0),
                conversions: parseInt(insights.conversions || 0),
                ctr: parseFloat(insights.ctr || 0),
                cpc: parseFloat(insights.cpc || 0),
                updated_at: new Date()
             },
             create: {
                id: adSet.id,
                campaign_id: adSet.campaign_id,
                name: adSet.name,
                status: adSet.status,
                daily_budget: adSet.daily_budget ? parseInt(adSet.daily_budget) : null,
                start_time: adSet.start_time ? new Date(adSet.start_time) : new Date(),
                targeting: adSet.targeting ? JSON.stringify(adSet.targeting) : null, // Storing as JSON
                // metrics
                spend: parseFloat(insights.spend || 0),
                impressions: parseInt(insights.impressions || 0),
                clicks: parseInt(insights.clicks || 0),
                conversions: parseInt(insights.conversions || 0),
                ctr: parseFloat(insights.ctr || 0),
                cpc: parseFloat(insights.cpc || 0),
                created_at: new Date(),
                updated_at: new Date()
             }
           });
         }
       });
       totalProcessed += adSetList.length;
    };

    // Process initial batch
    await processBatch(adSets);

    // Handle pagination
    while (adSets.hasNext()) {
        adSets = await adSets.next();
        await processBatch(adSets);
    }

    res.json({ 
      success: true, 
      message: `Successfully synced ${totalProcessed} ad sets.`,
      count: totalProcessed 
    });

  } catch (error: any) {
    console.error('Meta API AdSet Sync Error:', error);

    const errorCode = error.code || (error.response && error.response.error && error.response.error.code);
    if (errorCode === 17 || errorCode === 613) {
       return res.status(429).json({ error: 'Meta API rate limit reached. Sync aborted.' });
    }

    res.status(500).json({ error: 'Failed to sync ad sets', details: error.message });
  }
});

// POST /api/fetch-campaigns
// Fetches Campaigns from Meta Marketing API and updates the database.
router.post('/fetch-campaigns', async (req, res) => {
  try {
    const account = new AdAccount(AD_ACCOUNT_ID);

    const fields = [
      'id',
      'name',
      'status',
      'objective',
      'buying_type',
      'start_time',
      'insights.date_preset(maximum){spend,impressions,clicks,ctr,cpc,conversions,cpm}'
    ];

    const params: Record<string, any> = {
      limit: 50,
    };

    console.log(`Starting Campaign Sync for account ${AD_ACCOUNT_ID}...`);

    let campaigns = await account.getCampaigns(fields, params);
    let totalProcessed = 0;

    const processBatch = async (campaignList: any[]) => {
      await prisma.$transaction(async (tx) => {
        for (const camp of campaignList) {
          const insights = camp.insights?.[0] || {};
          
          await tx.campaign.upsert({
            where: { id: camp.id },
            update: {
              name: camp.name,
              status: camp.status,
              objective: camp.objective,
              buying_type: camp.buying_type,
              // metrics
              spend: parseFloat(insights.spend || 0),
              impressions: parseInt(insights.impressions || 0),
              clicks: parseInt(insights.clicks || 0),
              conversions: parseInt(insights.conversions || 0),
              ctr: parseFloat(insights.ctr || 0),
              cpc: parseFloat(insights.cpc || 0),
              cpm: parseFloat(insights.cpm || 0),
              updated_at: new Date()
            },
            create: {
              id: camp.id,
              name: camp.name,
              status: camp.status,
              objective: camp.objective,
              buying_type: camp.buying_type,
              fetched_at: new Date(),
              // metrics
              spend: parseFloat(insights.spend || 0),
              impressions: parseInt(insights.impressions || 0),
              clicks: parseInt(insights.clicks || 0),
              conversions: parseInt(insights.conversions || 0),
              ctr: parseFloat(insights.ctr || 0),
              cpc: parseFloat(insights.cpc || 0),
              cpm: parseFloat(insights.cpm || 0),
              created_at: new Date(),
              updated_at: new Date()
            }
          });
        }
      });
      totalProcessed += campaignList.length;
    };

    await processBatch(campaigns);

    while (campaigns.hasNext()) {
      campaigns = await campaigns.next();
      await processBatch(campaigns);
    }

    res.json({ 
      success: true, 
      message: `Successfully synced ${totalProcessed} campaigns.`, 
      count: totalProcessed 
    });

  } catch (error: any) {
    console.error('Meta API Campaign Sync Error:', error);
    const errorCode = error.code || (error.response && error.response.error && error.response.error.code);
    if (errorCode === 17 || errorCode === 613) {
       return res.status(429).json({ error: 'Meta API rate limit reached. Sync aborted.' });
    }
    res.status(500).json({ error: 'Failed to sync campaigns', details: error.message });
  }
});

// POST /api/sync-ads
// Fetches ads from Meta Marketing API, supports filtering, and updates database.
router.post('/sync-ads', async (req, res) => {
  const { adset_ids, campaign_ids } = req.body;

  try {
    const account = new AdAccount(AD_ACCOUNT_ID);
    
    // Define the fields we need from the API
    // We fetch creative data and aggregated insights for the lifetime (maximum)
    const fields = [
      'id', 
      'name', 
      'status', 
      'adset_id', 
      'campaign_id',
      'creative{id,title,body,image_url,thumbnail_url,call_to_action_type,link_url}',
      'insights.date_preset(maximum){spend,impressions,clicks,ctr,cpc,conversions,cpm}'
    ];

    // Build filtering parameters based on request body
    const filters = [];
    if (adset_ids && Array.isArray(adset_ids) && adset_ids.length > 0) {
      filters.push({ field: 'adset.id', operator: 'IN', value: adset_ids });
    }
    if (campaign_ids && Array.isArray(campaign_ids) && campaign_ids.length > 0) {
      filters.push({ field: 'campaign.id', operator: 'IN', value: campaign_ids });
    }

    const params: Record<string, any> = {
      limit: 100, // Batch size for pagination
    };

    if (filters.length > 0) {
      params.filtering = filters;
    }

    console.log(`Starting Ad Sync for account ${AD_ACCOUNT_ID}...`);
    
    // Fetch initial batch of ads
    let ads = await account.getAds(fields, params);
    let totalProcessed = 0;

    // Helper function to process and save a batch of ads
    const processBatch = async (adList: any[]) => {
      // Use a Prisma transaction to ensure data integrity
      await prisma.$transaction(async (tx) => {
        for (const adData of adList) {
          const insights = adData.insights?.[0] || {};
          const creative = adData.creative || {};
          
          // 1. Upsert Ad Creative
          // Check if we have minimal creative data to store
          if (creative.id) {
            await tx.adCreative.upsert({
              where: { id: creative.id },
              update: {
                title: creative.title,
                body: creative.body,
                image_url: creative.image_url || creative.thumbnail_url,
              },
              create: {
                id: creative.id,
                title: creative.title || 'Untitled Creative',
                body: creative.body || '',
                image_url: creative.image_url || creative.thumbnail_url || '',
                call_to_action: creative.call_to_action_type || 'NONE',
                link_url: creative.link_url || ''
              }
            });
          }

          // 2. Upsert Ad Record
          await tx.ad.upsert({
            where: { id: adData.id },
            update: {
              name: adData.name,
              status: adData.status,
              // Update metrics
              spend: parseFloat(insights.spend || 0),
              impressions: parseInt(insights.impressions || 0),
              clicks: parseInt(insights.clicks || 0),
              conversions: parseInt(insights.conversions || 0),
              ctr: parseFloat(insights.ctr || 0),
              cpc: parseFloat(insights.cpc || 0),
              updated_at: new Date()
            },
            create: {
              id: adData.id,
              name: adData.name,
              status: adData.status,
              adset_id: adData.adset_id,
              // Link to the creative we just upserted
              creative_id: creative.id || null, 
              // Initial metrics
              spend: parseFloat(insights.spend || 0),
              impressions: parseInt(insights.impressions || 0),
              clicks: parseInt(insights.clicks || 0),
              conversions: parseInt(insights.conversions || 0),
              ctr: parseFloat(insights.ctr || 0),
              cpc: parseFloat(insights.cpc || 0),
              created_at: new Date(),
              updated_at: new Date()
            }
          });
        }
      });
      totalProcessed += adList.length;
    };

    // Process the first page
    await processBatch(ads);

    // Handle Pagination: Loop while next page exists
    while (ads.hasNext()) {
      ads = await ads.next();
      await processBatch(ads);
    }

    res.json({ 
      success: true, 
      message: `Successfully synced ${totalProcessed} ads.`,
      count: totalProcessed
    });

  } catch (error: any) {
    console.error('Meta API Sync Error:', error);

    // Rate Limit Handling
    // Meta SDK errors often contain specific codes or header information
    const errorCode = error.code || (error.response && error.response.error && error.response.error.code);
    
    if (errorCode === 17 || errorCode === 613) {
       return res.status(429).json({ error: 'Meta API rate limit reached. Sync aborted.' });
    }

    res.status(500).json({ error: 'Failed to sync ads', details: error.message });
  }
});

export default router;
*/