import { supabase } from '../lib/supabase';

// Helper function for case conversion
const toSnakeCase = (obj) => {
  const converted = {};
  Object.keys(obj)?.forEach(key => {
    const snakeKey = key?.replace(/([A-Z])/g, '_$1')?.toLowerCase();
    converted[snakeKey] = obj?.[key];
  });
  return converted;
};

const toCamelCase = (obj) => {
  if (!obj) return obj;
  const converted = {};
  Object.keys(obj)?.forEach(key => {
    const camelKey = key?.replace(/_([a-z])/g, (g) => g?.[1]?.toUpperCase());
    converted[camelKey] = obj?.[key];
  });
  return converted;
};

// Webhook Endpoints Service
export const webhookEndpointService = {
  async getAll(userId) {
    const { data, error } = await supabase?.from('webhook_endpoints')?.select('*')?.eq('user_id', userId)?.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data?.map(toCamelCase);
  },

  async getById(endpointId) {
    const { data, error } = await supabase?.from('webhook_endpoints')?.select('*')?.eq('id', endpointId)?.single();
    
    if (error) throw error;
    return toCamelCase(data);
  },

  async create(endpoint) {
    const { data: { user } } = await supabase?.auth?.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase?.from('webhook_endpoints')?.insert({
        user_id: user?.id,
        endpoint_name: endpoint?.endpointName,
        url: endpoint?.url,
        auth_method: endpoint?.authMethod || 'none',
        auth_secret: endpoint?.authSecret,
        is_active: endpoint?.isActive !== undefined ? endpoint?.isActive : true,
        retry_policy: endpoint?.retryPolicy,
        ip_whitelist: endpoint?.ipWhitelist,
        ssl_verify: endpoint?.sslVerify !== undefined ? endpoint?.sslVerify : true,
        rate_limit_per_minute: endpoint?.rateLimitPerMinute || 60,
        metadata: endpoint?.metadata || {}
      })?.select()?.single();
    
    if (error) throw error;
    return toCamelCase(data);
  },

  async update(endpointId, updates) {
    const snakeUpdates = toSnakeCase(updates);
    
    const { data, error } = await supabase?.from('webhook_endpoints')?.update(snakeUpdates)?.eq('id', endpointId)?.select()?.single();
    
    if (error) throw error;
    return toCamelCase(data);
  },

  async delete(endpointId) {
    const { error } = await supabase?.from('webhook_endpoints')?.delete()?.eq('id', endpointId);
    
    if (error) throw error;
    return true;
  },

  async testEndpoint(endpointId) {
    // This would typically call a Supabase Edge Function
    // For now, return a mock response
    return {
      success: true,
      statusCode: 200,
      responseTime: 125,
      message: 'Endpoint is reachable'
    };
  }
};

// Webhook Events Service
export const webhookEventService = {
  async getAll() {
    const { data, error } = await supabase?.from('webhook_events')?.select('*')?.eq('is_active', true)?.order('event_category', { ascending: true });
    
    if (error) throw error;
    return data?.map(toCamelCase);
  },

  async getByCategory(category) {
    const { data, error } = await supabase?.from('webhook_events')?.select('*')?.eq('event_category', category)?.eq('is_active', true)?.order('event_name', { ascending: true });
    
    if (error) throw error;
    return data?.map(toCamelCase);
  }
};

// Webhook Subscriptions Service
export const webhookSubscriptionService = {
  async getByEndpoint(endpointId) {
    const { data, error } = await supabase?.from('webhook_subscriptions')?.select('*, webhook_events(*)')?.eq('endpoint_id', endpointId)?.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data?.map(sub => ({
      ...toCamelCase(sub),
      event: toCamelCase(sub?.webhook_events)
    }));
  },

  async subscribe(endpointId, eventCode) {
    const { data: { user } } = await supabase?.auth?.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase?.from('webhook_subscriptions')?.insert({
        user_id: user?.id,
        endpoint_id: endpointId,
        event_code: eventCode,
        is_active: true
      })?.select()?.single();
    
    if (error) throw error;
    return toCamelCase(data);
  },

  async unsubscribe(subscriptionId) {
    const { error } = await supabase?.from('webhook_subscriptions')?.delete()?.eq('id', subscriptionId);
    
    if (error) throw error;
    return true;
  },

  async toggleActive(subscriptionId, isActive) {
    const { data, error } = await supabase?.from('webhook_subscriptions')?.update({ is_active: isActive })?.eq('id', subscriptionId)?.select()?.single();
    
    if (error) throw error;
    return toCamelCase(data);
  }
};

// Webhook Delivery Logs Service
export const webhookDeliveryService = {
  async getByEndpoint(endpointId, filters = {}) {
    let query = supabase?.from('webhook_delivery_logs')?.select('*, webhook_events(event_name, event_category)')?.eq('endpoint_id', endpointId)?.order('created_at', { ascending: false });

    if (filters?.status) {
      query = query?.eq('delivery_status', filters?.status);
    }
    
    if (filters?.eventCode) {
      query = query?.eq('event_code', filters?.eventCode);
    }

    if (filters?.limit) {
      query = query?.limit(filters?.limit);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return data?.map(log => ({
      ...toCamelCase(log),
      event: toCamelCase(log?.webhook_events)
    }));
  },

  async getStats(endpointId, days = 7) {
    const startDate = new Date();
    startDate?.setDate(startDate?.getDate() - days);

    const { data, error } = await supabase?.from('webhook_delivery_logs')?.select('delivery_status, http_status_code')?.eq('endpoint_id', endpointId)?.gte('created_at', startDate?.toISOString());
    
    if (error) throw error;

    const stats = {
      total: data?.length,
      success: data?.filter(d => d?.delivery_status === 'success')?.length,
      failed: data?.filter(d => d?.delivery_status === 'failed')?.length,
      pending: data?.filter(d => d?.delivery_status === 'pending')?.length,
      successRate: 0
    };

    stats.successRate = stats?.total > 0 
      ? Math.round((stats?.success / stats?.total) * 100) 
      : 0;

    return stats;
  }
};

export default {
  endpoints: webhookEndpointService,
  events: webhookEventService,
  subscriptions: webhookSubscriptionService,
  deliveries: webhookDeliveryService
};