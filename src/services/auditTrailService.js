import { supabase } from '../lib/supabase';

/**
 * Audit Trail Service - Comprehensive audit tracking and compliance reporting
 * Handles API access logs, webhook deliveries, data modifications, and security events
 */
export const auditTrailService = {
  /**
   * Get unified audit trail with filtering
   */
  async getAuditTrail(filters = {}) {
    const {
      eventCategory = null,
      userId = null,
      ipAddress = null,
      resource = null,
      startDate = null,
      endDate = null,
      limit = 100,
      offset = 0
    } = filters;

    let query = supabase?.from('unified_audit_trail')?.select('*', { count: 'exact' })?.order('created_at', { ascending: false })?.range(offset, offset + limit - 1);

    if (eventCategory) {
      query = query?.eq('event_category', eventCategory);
    }

    if (userId) {
      query = query?.eq('user_id', userId);
    }

    if (ipAddress) {
      query = query?.eq('ip_address', ipAddress);
    }

    if (resource) {
      query = query?.ilike('resource', `%${resource}%`);
    }

    if (startDate) {
      query = query?.gte('created_at', startDate);
    }

    if (endDate) {
      query = query?.lte('created_at', endDate);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      events: data || [],
      totalCount: count || 0
    };
  },

  /**
   * Get audit statistics
   */
  async getStatistics(startDate, endDate) {
    const { data, error } = await supabase?.rpc('get_audit_statistics', {
        start_date: startDate,
        end_date: endDate
      });

    if (error) throw error;

    return data?.[0] || {
      totalApiCalls: 0,
      failedApiCalls: 0,
      webhookSuccessRate: 0,
      totalDataModifications: 0,
      criticalSecurityEvents: 0,
      unresolvedSecurityEvents: 0
    };
  },

  /**
   * Get API access logs
   */
  async getApiAccessLogs(filters = {}) {
    const {
      userId = null,
      endpoint = null,
      method = null,
      statusCode = null,
      startDate = null,
      endDate = null,
      limit = 50
    } = filters;

    let query = supabase?.from('api_access_logs')?.select('*')?.order('created_at', { ascending: false })?.limit(limit);

    if (userId) {
      query = query?.eq('user_id', userId);
    }

    if (endpoint) {
      query = query?.ilike('endpoint', `%${endpoint}%`);
    }

    if (method) {
      query = query?.eq('method', method);
    }

    if (statusCode) {
      query = query?.eq('status_code', statusCode);
    }

    if (startDate) {
      query = query?.gte('created_at', startDate);
    }

    if (endDate) {
      query = query?.lte('created_at', endDate);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Convert snake_case to camelCase
    return (data || [])?.map(log => ({
      id: log?.id,
      userId: log?.user_id,
      endpoint: log?.endpoint,
      method: log?.method,
      statusCode: log?.status_code,
      requestPayload: log?.request_payload,
      responsePayload: log?.response_payload,
      ipAddress: log?.ip_address,
      userAgent: log?.user_agent,
      durationMs: log?.duration_ms,
      apiKeyUsed: log?.api_key_used,
      queryParams: log?.query_params,
      headers: log?.headers,
      errorMessage: log?.error_message,
      createdAt: log?.created_at
    }));
  },

  /**
   * Get security events
   */
  async getSecurityEvents(filters = {}) {
    const {
      eventType = null,
      severity = null,
      userId = null,
      isResolved = null,
      startDate = null,
      endDate = null,
      limit = 50
    } = filters;

    let query = supabase?.from('security_events')?.select('*')?.order('created_at', { ascending: false })?.limit(limit);

    if (eventType) {
      query = query?.eq('event_type', eventType);
    }

    if (severity) {
      query = query?.eq('severity', severity);
    }

    if (userId) {
      query = query?.eq('user_id', userId);
    }

    if (isResolved !== null) {
      query = query?.eq('is_resolved', isResolved);
    }

    if (startDate) {
      query = query?.gte('created_at', startDate);
    }

    if (endDate) {
      query = query?.lte('created_at', endDate);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Convert snake_case to camelCase
    return (data || [])?.map(event => ({
      id: event?.id,
      eventType: event?.event_type,
      severity: event?.severity,
      userId: event?.user_id,
      ipAddress: event?.ip_address,
      description: event?.description,
      affectedResource: event?.affected_resource,
      actionTaken: event?.action_taken,
      metadata: event?.metadata,
      isResolved: event?.is_resolved,
      resolvedAt: event?.resolved_at,
      resolvedBy: event?.resolved_by,
      complianceStatus: event?.compliance_status,
      createdAt: event?.created_at
    }));
  },

  /**
   * Resolve security event
   */
  async resolveSecurityEvent(eventId, actionTaken) {
    const { data: { user } } = await supabase?.auth?.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase?.from('security_events')?.update({
        is_resolved: true,
        action_taken: actionTaken,
        resolved_by: user?.id
      })?.eq('id', eventId)?.select()?.single();

    if (error) throw error;

    return {
      id: data?.id,
      isResolved: data?.is_resolved,
      actionTaken: data?.action_taken,
      resolvedAt: data?.resolved_at,
      resolvedBy: data?.resolved_by
    };
  },

  /**
   * Export audit trail data to CSV
   */
  async exportToCsv(filters = {}) {
    const { events } = await this.getAuditTrail({
      ...filters,
      limit: 10000 // Export limit
    });

    if (!events || events?.length === 0) {
      throw new Error('No data to export');
    }

    // CSV headers
    const headers = ['Timestamp', 'Category', 'User ID', 'Resource', 'Action', 'Outcome', 'IP Address'];
    
    // CSV rows
    const rows = events?.map(event => [
      new Date(event.created_at)?.toISOString(),
      event?.event_category,
      event?.user_id || 'N/A',
      event?.resource || 'N/A',
      event?.action || 'N/A',
      event?.outcome || 'N/A',
      event?.ip_address || 'N/A'
    ]);

    // Create CSV content
    const csvContent = [
      headers?.join(','),
      ...rows?.map(row => row?.map(cell => `"${cell}"`)?.join(','))
    ]?.join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link?.setAttribute('href', url);
    link?.setAttribute('download', `audit_trail_${new Date()?.toISOString()}.csv`);
    link.style.visibility = 'hidden';
    
    document.body?.appendChild(link);
    link?.click();
    document.body?.removeChild(link);

    return { success: true, recordCount: events?.length };
  },

  /**
   * Get webhook delivery logs
   */
  async getWebhookDeliveries(filters = {}) {
    const {
      endpointId = null,
      eventCode = null,
      deliveryStatus = null,
      startDate = null,
      endDate = null,
      limit = 50
    } = filters;

    let query = supabase?.from('webhook_delivery_logs')?.select('*')?.order('created_at', { ascending: false })?.limit(limit);

    if (endpointId) {
      query = query?.eq('endpoint_id', endpointId);
    }

    if (eventCode) {
      query = query?.eq('event_code', eventCode);
    }

    if (deliveryStatus) {
      query = query?.eq('delivery_status', deliveryStatus);
    }

    if (startDate) {
      query = query?.gte('created_at', startDate);
    }

    if (endDate) {
      query = query?.lte('created_at', endDate);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Convert snake_case to camelCase
    return (data || [])?.map(log => ({
      id: log?.id,
      endpointId: log?.endpoint_id,
      eventCode: log?.event_code,
      deliveryStatus: log?.delivery_status,
      httpStatusCode: log?.http_status_code,
      deliveryDurationMs: log?.delivery_duration_ms,
      retryCount: log?.retry_count,
      errorMessage: log?.error_message,
      requestPayload: log?.request_payload,
      responseBody: log?.response_body,
      createdAt: log?.created_at,
      deliveredAt: log?.delivered_at
    }));
  },

  /**
   * Get data modification history
   */
  async getDataModifications(filters = {}) {
    const {
      userId = null,
      entityType = null,
      action = null,
      isCritical = null,
      startDate = null,
      endDate = null,
      limit = 50
    } = filters;

    let query = supabase?.from('change_history')?.select('*')?.order('created_at', { ascending: false })?.limit(limit);

    if (userId) {
      query = query?.eq('user_id', userId);
    }

    if (entityType) {
      query = query?.eq('entity_type', entityType);
    }

    if (action) {
      query = query?.eq('action', action);
    }

    if (isCritical !== null) {
      query = query?.eq('is_critical', isCritical);
    }

    if (startDate) {
      query = query?.gte('created_at', startDate);
    }

    if (endDate) {
      query = query?.lte('created_at', endDate);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Convert snake_case to camelCase
    return (data || [])?.map(change => ({
      id: change?.id,
      userId: change?.user_id,
      entityType: change?.entity_type,
      entityId: change?.entity_id,
      entityTitle: change?.entity_title,
      action: change?.action,
      fieldChanged: change?.field_changed,
      oldValue: change?.old_value,
      newValue: change?.new_value,
      isCritical: change?.is_critical,
      canRollback: change?.can_rollback,
      changeReason: change?.change_reason,
      createdAt: change?.created_at
    }));
  }
};

export default auditTrailService;