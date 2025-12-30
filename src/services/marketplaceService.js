import { supabase } from '../lib/supabase';

/**
 * Marketplace Service - Handles all marketplace integration operations
 */

/**
 * Get all available marketplace integrations with optional filtering
 */
export const getMarketplaceIntegrations = async (filters = {}) => {
  try {
    let query = supabase?.from('marketplace_integrations')?.select('*')?.eq('is_active', true)?.order('installation_count', { ascending: false });

    // Apply category filter
    if (filters?.category && filters?.category !== 'all') {
      query = query?.eq('category', filters?.category);
    }

    // Apply pricing filter
    if (filters?.pricing && filters?.pricing !== 'all') {
      query = query?.eq('pricing_model', filters?.pricing);
    }

    // Apply search query
    if (filters?.search) {
      query = query?.or(`name.ilike.%${filters?.search}%,description.ilike.%${filters?.search}%,provider_name.ilike.%${filters?.search}%`);
    }

    // Apply featured filter
    if (filters?.featured) {
      query = query?.eq('is_featured', true);
    }

    // Apply sorting
    if (filters?.sortBy) {
      switch (filters?.sortBy) {
        case 'rating':
          query = query?.order('rating', { ascending: false });
          break;
        case 'popular':
          query = query?.order('installation_count', { ascending: false });
          break;
        case 'name':
          query = query?.order('name', { ascending: true });
          break;
        default:
          break;
      }
    }

    const { data, error } = await query;

    if (error) throw error;

    return {
      success: true,
      data: data?.map(integration => ({
        id: integration?.id,
        name: integration?.name,
        description: integration?.description,
        providerName: integration?.provider_name,
        category: integration?.category,
        logoUrl: integration?.logo_url,
        websiteUrl: integration?.website_url,
        documentationUrl: integration?.documentation_url,
        pricingModel: integration?.pricing_model,
        basePrice: integration?.base_price,
        currency: integration?.currency,
        installationCount: integration?.installation_count,
        rating: integration?.rating,
        reviewCount: integration?.review_count,
        isFeatured: integration?.is_featured,
        complianceCertifications: integration?.compliance_certifications,
        features: integration?.features,
        createdAt: integration?.created_at,
        updatedAt: integration?.updated_at
      })) || []
    };
  } catch (error) {
    console.error('Error fetching marketplace integrations:', error);
    return {
      success: false,
      error: error?.message
    };
  }
};

/**
 * Get featured marketplace integrations
 */
export const getFeaturedIntegrations = async () => {
  return getMarketplaceIntegrations({ featured: true, sortBy: 'rating' });
};

/**
 * Get integration by ID
 */
export const getIntegrationById = async (integrationId) => {
  try {
    const { data, error } = await supabase?.from('marketplace_integrations')?.select('*')?.eq('id', integrationId)?.single();

    if (error) throw error;

    return {
      success: true,
      data: data ? {
        id: data?.id,
        name: data?.name,
        description: data?.description,
        providerName: data?.provider_name,
        category: data?.category,
        logoUrl: data?.logo_url,
        websiteUrl: data?.website_url,
        documentationUrl: data?.documentation_url,
        pricingModel: data?.pricing_model,
        basePrice: data?.base_price,
        currency: data?.currency,
        installationCount: data?.installation_count,
        rating: data?.rating,
        reviewCount: data?.review_count,
        isFeatured: data?.is_featured,
        complianceCertifications: data?.compliance_certifications,
        features: data?.features,
        apiEndpoint: data?.api_endpoint,
        webhookUrl: data?.webhook_url,
        oauthConfig: data?.oauth_config,
        metadata: data?.metadata,
        createdAt: data?.created_at,
        updatedAt: data?.updated_at
      } : null
    };
  } catch (error) {
    console.error('Error fetching integration:', error);
    return {
      success: false,
      error: error?.message
    };
  }
};

/**
 * Get user's connected integrations
 */
export const getUserIntegrations = async (userId) => {
  try {
    const { data, error } = await supabase?.from('user_integrations')?.select(`
        *,
        integration:marketplace_integrations(*)
      `)?.eq('user_id', userId)?.order('connected_at', { ascending: false });

    if (error) throw error;

    return {
      success: true,
      data: data?.map(userInt => ({
        id: userInt?.id,
        userId: userInt?.user_id,
        integrationId: userInt?.integration_id,
        status: userInt?.status,
        connectionName: userInt?.connection_name,
        lastSyncAt: userInt?.last_sync_at,
        syncFrequencyMinutes: userInt?.sync_frequency_minutes,
        autoSync: userInt?.auto_sync,
        configuration: userInt?.configuration,
        errorMessage: userInt?.error_message,
        errorCount: userInt?.error_count,
        connectedAt: userInt?.connected_at,
        disconnectedAt: userInt?.disconnected_at,
        integration: userInt?.integration ? {
          id: userInt?.integration?.id,
          name: userInt?.integration?.name,
          description: userInt?.integration?.description,
          providerName: userInt?.integration?.provider_name,
          category: userInt?.integration?.category,
          logoUrl: userInt?.integration?.logo_url,
          rating: userInt?.integration?.rating,
          reviewCount: userInt?.integration?.review_count
        } : null
      })) || []
    };
  } catch (error) {
    console.error('Error fetching user integrations:', error);
    return {
      success: false,
      error: error?.message
    };
  }
};

/**
 * Connect a new integration
 */
export const connectIntegration = async (userId, integrationId, config = {}) => {
  try {
    const { data, error } = await supabase?.from('user_integrations')?.insert({
        user_id: userId,
        integration_id: integrationId,
        status: 'pending',
        connection_name: config?.connectionName || null,
        configuration: config?.configuration || {},
        auto_sync: config?.autoSync !== undefined ? config?.autoSync : true,
        sync_frequency_minutes: config?.syncFrequency || 60
      })?.select()?.single();

    if (error) throw error;

    // Update installation count
    await supabase?.rpc('increment_installation_count', {
      integration_uuid: integrationId
    });

    return {
      success: true,
      data: {
        id: data?.id,
        userId: data?.user_id,
        integrationId: data?.integration_id,
        status: data?.status,
        connectionName: data?.connection_name,
        connectedAt: data?.connected_at
      }
    };
  } catch (error) {
    console.error('Error connecting integration:', error);
    return {
      success: false,
      error: error?.message
    };
  }
};

/**
 * Disconnect an integration
 */
export const disconnectIntegration = async (userIntegrationId) => {
  try {
    const { data, error } = await supabase?.from('user_integrations')?.update({
        status: 'disconnected',
        disconnected_at: new Date()?.toISOString()
      })?.eq('id', userIntegrationId)?.select()?.single();

    if (error) throw error;

    return {
      success: true,
      data: {
        id: data?.id,
        status: data?.status,
        disconnectedAt: data?.disconnected_at
      }
    };
  } catch (error) {
    console.error('Error disconnecting integration:', error);
    return {
      success: false,
      error: error?.message
    };
  }
};

/**
 * Update integration configuration
 */
export const updateIntegrationConfig = async (userIntegrationId, config) => {
  try {
    const updateData = {};
    
    if (config?.connectionName !== undefined) {
      updateData.connection_name = config?.connectionName;
    }
    if (config?.autoSync !== undefined) {
      updateData.auto_sync = config?.autoSync;
    }
    if (config?.syncFrequency !== undefined) {
      updateData.sync_frequency_minutes = config?.syncFrequency;
    }
    if (config?.configuration !== undefined) {
      updateData.configuration = config?.configuration;
    }

    const { data, error } = await supabase?.from('user_integrations')?.update(updateData)?.eq('id', userIntegrationId)?.select()?.single();

    if (error) throw error;

    return {
      success: true,
      data: {
        id: data?.id,
        connectionName: data?.connection_name,
        autoSync: data?.auto_sync,
        syncFrequencyMinutes: data?.sync_frequency_minutes,
        configuration: data?.configuration
      }
    };
  } catch (error) {
    console.error('Error updating integration config:', error);
    return {
      success: false,
      error: error?.message
    };
  }
};

/**
 * Get integration sync logs
 */
export const getIntegrationSyncLogs = async (userIntegrationId, limit = 10) => {
  try {
    const { data, error } = await supabase?.from('integration_sync_logs')?.select('*')?.eq('user_integration_id', userIntegrationId)?.order('created_at', { ascending: false })?.limit(limit);

    if (error) throw error;

    return {
      success: true,
      data: data?.map(log => ({
        id: log?.id,
        userIntegrationId: log?.user_integration_id,
        syncType: log?.sync_type,
        status: log?.status,
        recordsSynced: log?.records_synced,
        recordsFailed: log?.records_failed,
        errorDetails: log?.error_details,
        startedAt: log?.started_at,
        completedAt: log?.completed_at,
        durationSeconds: log?.duration_seconds,
        createdAt: log?.created_at
      })) || []
    };
  } catch (error) {
    console.error('Error fetching sync logs:', error);
    return {
      success: false,
      error: error?.message
    };
  }
};

/**
 * Get integration reviews
 */
export const getIntegrationReviews = async (integrationId, limit = 10) => {
  try {
    const { data, error } = await supabase?.from('integration_reviews')?.select(`
        *,
        user:user_profiles(full_name, avatar_url)
      `)?.eq('integration_id', integrationId)?.order('created_at', { ascending: false })?.limit(limit);

    if (error) throw error;

    return {
      success: true,
      data: data?.map(review => ({
        id: review?.id,
        integrationId: review?.integration_id,
        userId: review?.user_id,
        rating: review?.rating,
        reviewTitle: review?.review_title,
        reviewText: review?.review_text,
        isVerified: review?.is_verified,
        helpfulCount: review?.helpful_count,
        user: review?.user ? {
          fullName: review?.user?.full_name,
          avatarUrl: review?.user?.avatar_url
        } : null,
        createdAt: review?.created_at,
        updatedAt: review?.updated_at
      })) || []
    };
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return {
      success: false,
      error: error?.message
    };
  }
};

/**
 * Add integration review
 */
export const addIntegrationReview = async (integrationId, userId, reviewData) => {
  try {
    const { data, error } = await supabase?.from('integration_reviews')?.insert({
        integration_id: integrationId,
        user_id: userId,
        rating: reviewData?.rating,
        review_title: reviewData?.title,
        review_text: reviewData?.text
      })?.select()?.single();

    if (error) throw error;

    return {
      success: true,
      data: {
        id: data?.id,
        integrationId: data?.integration_id,
        userId: data?.user_id,
        rating: data?.rating,
        reviewTitle: data?.review_title,
        reviewText: data?.review_text,
        createdAt: data?.created_at
      }
    };
  } catch (error) {
    console.error('Error adding review:', error);
    return {
      success: false,
      error: error?.message
    };
  }
};

export default {
  getMarketplaceIntegrations,
  getFeaturedIntegrations,
  getIntegrationById,
  getUserIntegrations,
  connectIntegration,
  disconnectIntegration,
  updateIntegrationConfig,
  getIntegrationSyncLogs,
  getIntegrationReviews,
  addIntegrationReview
};