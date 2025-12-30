import { supabase } from '../lib/supabase';

export const activityMonitorService = {
  // Active Sessions
  async getActiveSessions() {
    const { data, error } = await supabase?.from('active_sessions')?.select(`
        *,
        user_profiles (
          full_name,
          email,
          avatar_url,
          role
        )
      `)?.order('last_activity', { ascending: false });
    
    if (error) throw error;
    
    return data?.map(session => ({
      id: session?.id,
      userId: session?.user_id,
      status: session?.status,
      currentScreen: session?.current_screen,
      lastActivity: session?.last_activity,
      sessionStarted: session?.session_started,
      ipAddress: session?.ip_address,
      userAgent: session?.user_agent,
      createdAt: session?.created_at,
      updatedAt: session?.updated_at,
      userProfile: session?.user_profiles ? {
        fullName: session?.user_profiles?.full_name,
        email: session?.user_profiles?.email,
        avatarUrl: session?.user_profiles?.avatar_url,
        role: session?.user_profiles?.role
      } : null
    })) || [];
  },

  async updateSession(sessionId, updates) {
    const { data: { user } } = await supabase?.auth?.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase?.from('active_sessions')?.update({
        status: updates?.status,
        current_screen: updates?.currentScreen,
        last_activity: new Date()?.toISOString()
      })?.eq('id', sessionId)?.select()?.single();
    
    if (error) throw error;
    return data;
  },

  // Document Edits
  async getDocumentEdits() {
    const { data, error } = await supabase?.from('document_edits')?.select(`
        *,
        user_profiles (
          full_name,
          email,
          avatar_url
        )
      `)?.in('edit_status', ['draft', 'in_progress'])?.order('last_modified', { ascending: false });
    
    if (error) throw error;
    
    return data?.map(edit => ({
      id: edit?.id,
      userId: edit?.user_id,
      documentType: edit?.document_type,
      documentId: edit?.document_id,
      documentTitle: edit?.document_title,
      editStatus: edit?.edit_status,
      startedAt: edit?.started_at,
      lastModified: edit?.last_modified,
      changesCount: edit?.changes_count,
      isConcurrent: edit?.is_concurrent,
      concurrentUsers: edit?.concurrent_users,
      createdAt: edit?.created_at,
      updatedAt: edit?.updated_at,
      userProfile: edit?.user_profiles ? {
        fullName: edit?.user_profiles?.full_name,
        email: edit?.user_profiles?.email,
        avatarUrl: edit?.user_profiles?.avatar_url
      } : null
    })) || [];
  },

  // Activity Logs
  async getActivityLogs(filters = {}) {
    let query = supabase?.from('activity_logs')?.select(`
        *,
        user_profiles (
          full_name,
          email,
          avatar_url
        )
      `)?.order('created_at', { ascending: false });
    
    if (filters?.userId) {
      query = query?.eq('user_id', filters?.userId);
    }
    
    if (filters?.module) {
      query = query?.eq('module', filters?.module);
    }
    
    if (filters?.activityType) {
      query = query?.eq('activity_type', filters?.activityType);
    }
    
    if (filters?.limit) {
      query = query?.limit(filters?.limit);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return data?.map(log => ({
      id: log?.id,
      userId: log?.user_id,
      activityType: log?.activity_type,
      description: log?.description,
      module: log?.module,
      entityType: log?.entity_type,
      entityId: log?.entity_id,
      metadata: log?.metadata,
      ipAddress: log?.ip_address,
      createdAt: log?.created_at,
      userProfile: log?.user_profiles ? {
        fullName: log?.user_profiles?.full_name,
        email: log?.user_profiles?.email,
        avatarUrl: log?.user_profiles?.avatar_url
      } : null
    })) || [];
  },

  async createActivityLog(activityData) {
    const { data: { user } } = await supabase?.auth?.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase?.from('activity_logs')?.insert({
        user_id: user?.id,
        activity_type: activityData?.activityType,
        description: activityData?.description,
        module: activityData?.module,
        entity_type: activityData?.entityType,
        entity_id: activityData?.entityId,
        metadata: activityData?.metadata || {}
      })?.select()?.single();
    
    if (error) throw error;
    return data;
  },

  // Change History
  async getChangeHistory(filters = {}) {
    let query = supabase?.from('change_history')?.select(`
        *,
        user_profiles (
          full_name,
          email,
          avatar_url
        )
      `)?.order('created_at', { ascending: false });
    
    if (filters?.entityType) {
      query = query?.eq('entity_type', filters?.entityType);
    }
    
    if (filters?.entityId) {
      query = query?.eq('entity_id', filters?.entityId);
    }
    
    if (filters?.userId) {
      query = query?.eq('user_id', filters?.userId);
    }
    
    if (filters?.isCritical !== undefined) {
      query = query?.eq('is_critical', filters?.isCritical);
    }
    
    if (filters?.limit) {
      query = query?.limit(filters?.limit);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return data?.map(change => ({
      id: change?.id,
      userId: change?.user_id,
      entityType: change?.entity_type,
      entityId: change?.entity_id,
      entityTitle: change?.entity_title,
      action: change?.action,
      fieldChanged: change?.field_changed,
      oldValue: change?.old_value,
      newValue: change?.new_value,
      changeReason: change?.change_reason,
      canRollback: change?.can_rollback,
      isCritical: change?.is_critical,
      createdAt: change?.created_at,
      userProfile: change?.user_profiles ? {
        fullName: change?.user_profiles?.full_name,
        email: change?.user_profiles?.email,
        avatarUrl: change?.user_profiles?.avatar_url
      } : null
    })) || [];
  },

  async createChangeHistory(changeData) {
    const { data: { user } } = await supabase?.auth?.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase?.from('change_history')?.insert({
        user_id: user?.id,
        entity_type: changeData?.entityType,
        entity_id: changeData?.entityId,
        entity_title: changeData?.entityTitle,
        action: changeData?.action,
        field_changed: changeData?.fieldChanged,
        old_value: changeData?.oldValue,
        new_value: changeData?.newValue,
        change_reason: changeData?.changeReason,
        can_rollback: changeData?.canRollback || false,
        is_critical: changeData?.isCritical || false
      })?.select()?.single();
    
    if (error) throw error;
    return data;
  },

  // Real-time subscriptions
  subscribeToActiveSessions(callback) {
    const channel = supabase?.channel('active_sessions_changes')?.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'active_sessions' },
        (payload) => callback(payload)
      )?.subscribe();
    
    return () => supabase?.removeChannel(channel);
  },

  subscribeToDocumentEdits(callback) {
    const channel = supabase?.channel('document_edits_changes')?.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'document_edits' },
        (payload) => callback(payload)
      )?.subscribe();
    
    return () => supabase?.removeChannel(channel);
  },

  subscribeToActivityLogs(callback) {
    const channel = supabase?.channel('activity_logs_changes')?.on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'activity_logs' },
        (payload) => callback(payload)
      )?.subscribe();
    
    return () => supabase?.removeChannel(channel);
  },

  subscribeToChangeHistory(callback) {
    const channel = supabase?.channel('change_history_changes')?.on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'change_history' },
        (payload) => callback(payload)
      )?.subscribe();
    
    return () => supabase?.removeChannel(channel);
  }
};