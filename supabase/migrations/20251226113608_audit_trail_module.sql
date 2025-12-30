-- Location: supabase/migrations/20251226113608_audit_trail_module.sql
-- Schema Analysis: Existing activity_logs, webhook_delivery_logs, change_history tables
-- Integration Type: Extension - adding API access and security event tracking
-- Dependencies: user_profiles, activity_logs, webhook_delivery_logs, change_history

-- 1. Create custom ENUM types for audit trail
CREATE TYPE public.audit_event_type AS ENUM (
    'api_access',
    'webhook_delivery',
    'data_modification',
    'security_event',
    'authentication',
    'authorization'
);

CREATE TYPE public.security_event_type AS ENUM (
    'failed_login',
    'suspicious_activity',
    'unauthorized_access',
    'rate_limit_exceeded',
    'data_breach_attempt',
    'privilege_escalation'
);

CREATE TYPE public.api_method AS ENUM ('GET', 'POST', 'PUT', 'PATCH', 'DELETE');

CREATE TYPE public.compliance_status AS ENUM ('compliant', 'non_compliant', 'pending_review');

-- 2. Create API Access Logs table
CREATE TABLE public.api_access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    endpoint TEXT NOT NULL,
    method public.api_method NOT NULL,
    status_code INTEGER NOT NULL,
    request_payload JSONB,
    response_payload JSONB,
    ip_address TEXT,
    user_agent TEXT,
    duration_ms INTEGER,
    api_key_used TEXT,
    query_params JSONB,
    headers JSONB,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create Security Events table
CREATE TABLE public.security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type public.security_event_type NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    ip_address TEXT,
    description TEXT NOT NULL,
    affected_resource TEXT,
    action_taken TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    is_resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    compliance_status public.compliance_status DEFAULT 'pending_review'::public.compliance_status,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create Audit Trail View (unified view of all audit events)
CREATE VIEW public.unified_audit_trail AS
SELECT 
    id,
    'api_access'::text as event_category,
    user_id,
    endpoint as resource,
    method::text as action,
    status_code::text as outcome,
    ip_address,
    created_at
FROM public.api_access_logs
UNION ALL
SELECT 
    id,
    'webhook_delivery'::text as event_category,
    NULL as user_id,
    event_code as resource,
    'webhook'::text as action,
    delivery_status::text as outcome,
    NULL as ip_address,
    created_at
FROM public.webhook_delivery_logs
UNION ALL
SELECT 
    id,
    'data_modification'::text as event_category,
    user_id,
    entity_type as resource,
    action,
    'completed'::text as outcome,
    NULL as ip_address,
    created_at
FROM public.change_history
UNION ALL
SELECT 
    id,
    'security_event'::text as event_category,
    user_id,
    affected_resource as resource,
    event_type::text as action,
    severity as outcome,
    ip_address,
    created_at
FROM public.security_events
UNION ALL
SELECT 
    id,
    'activity'::text as event_category,
    user_id,
    module as resource,
    activity_type::text as action,
    'completed'::text as outcome,
    ip_address,
    created_at
FROM public.activity_logs;

-- 5. Create indexes for performance
CREATE INDEX idx_api_access_logs_user_id ON public.api_access_logs(user_id);
CREATE INDEX idx_api_access_logs_endpoint ON public.api_access_logs(endpoint);
CREATE INDEX idx_api_access_logs_created_at ON public.api_access_logs(created_at DESC);
CREATE INDEX idx_api_access_logs_status_code ON public.api_access_logs(status_code);
CREATE INDEX idx_api_access_logs_method ON public.api_access_logs(method);

CREATE INDEX idx_security_events_user_id ON public.security_events(user_id);
CREATE INDEX idx_security_events_event_type ON public.security_events(event_type);
CREATE INDEX idx_security_events_severity ON public.security_events(severity);
CREATE INDEX idx_security_events_created_at ON public.security_events(created_at DESC);
CREATE INDEX idx_security_events_is_resolved ON public.security_events(is_resolved);

-- 6. Enable RLS
ALTER TABLE public.api_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies (Pattern 2: Simple ownership, Pattern 6: Admin access)
CREATE POLICY "users_view_own_api_logs"
ON public.api_access_logs
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "users_view_own_security_events"
ON public.security_events
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "admin_full_access_api_logs"
ON public.api_access_logs
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = auth.uid() AND up.role = 'admin'
    )
);

CREATE POLICY "admin_full_access_security_events"
ON public.security_events
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = auth.uid() AND up.role = 'admin'
    )
);

-- 8. Create helper functions
CREATE OR REPLACE FUNCTION public.get_audit_statistics(
    start_date TIMESTAMPTZ DEFAULT (CURRENT_TIMESTAMP - INTERVAL '30 days'),
    end_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
)
RETURNS TABLE(
    total_api_calls BIGINT,
    failed_api_calls BIGINT,
    webhook_success_rate NUMERIC,
    total_data_modifications BIGINT,
    critical_security_events BIGINT,
    unresolved_security_events BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT COUNT(*) FROM public.api_access_logs 
         WHERE created_at BETWEEN start_date AND end_date) as total_api_calls,
        (SELECT COUNT(*) FROM public.api_access_logs 
         WHERE created_at BETWEEN start_date AND end_date AND status_code >= 400) as failed_api_calls,
        (SELECT CASE 
            WHEN COUNT(*) = 0 THEN 0 
            ELSE ROUND((COUNT(*) FILTER (WHERE delivery_status = 'success')::numeric / COUNT(*)) * 100, 2)
         END
         FROM public.webhook_delivery_logs 
         WHERE created_at BETWEEN start_date AND end_date) as webhook_success_rate,
        (SELECT COUNT(*) FROM public.change_history 
         WHERE created_at BETWEEN start_date AND end_date) as total_data_modifications,
        (SELECT COUNT(*) FROM public.security_events 
         WHERE created_at BETWEEN start_date AND end_date AND severity = 'critical') as critical_security_events,
        (SELECT COUNT(*) FROM public.security_events 
         WHERE created_at BETWEEN start_date AND end_date AND is_resolved = false) as unresolved_security_events;
END;
$func$;

-- 9. Create trigger for automatic updated_at handling
CREATE OR REPLACE FUNCTION public.handle_audit_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.resolved_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_security_event_resolved_at
BEFORE UPDATE OF is_resolved ON public.security_events
FOR EACH ROW
WHEN (NEW.is_resolved = true AND OLD.is_resolved = false)
EXECUTE FUNCTION public.handle_audit_updated_at();

-- 10. Create mock data for testing
DO $$
DECLARE
    admin_user_id UUID;
    regular_user_id UUID;
BEGIN
    -- Get existing user IDs
    SELECT id INTO admin_user_id FROM public.user_profiles WHERE role = 'admin' LIMIT 1;
    SELECT id INTO regular_user_id FROM public.user_profiles WHERE role = 'user' LIMIT 1;

    -- Insert API Access Logs
    INSERT INTO public.api_access_logs (user_id, endpoint, method, status_code, ip_address, duration_ms) VALUES
        (admin_user_id, '/api/v1/invoices', 'GET', 200, '192.168.1.100', 145),
        (admin_user_id, '/api/v1/clients', 'POST', 201, '192.168.1.100', 320),
        (regular_user_id, '/api/v1/payments', 'GET', 200, '192.168.1.105', 98),
        (regular_user_id, '/api/v1/expenses', 'PUT', 200, '192.168.1.105', 256),
        (admin_user_id, '/api/v1/reports', 'GET', 403, '192.168.1.100', 45),
        (regular_user_id, '/api/v1/dashboard', 'GET', 500, '192.168.1.105', 1250);

    -- Insert Security Events
    INSERT INTO public.security_events (event_type, severity, user_id, ip_address, description, affected_resource, is_resolved) VALUES
        ('failed_login', 'medium', NULL, '203.0.113.45', 'Multiple failed login attempts detected', 'auth/login', false),
        ('unauthorized_access', 'high', regular_user_id, '192.168.1.105', 'Attempted to access admin-only endpoint', '/api/v1/admin/settings', false),
        ('rate_limit_exceeded', 'low', admin_user_id, '192.168.1.100', 'API rate limit exceeded for user', '/api/v1/invoices', true),
        ('suspicious_activity', 'critical', NULL, '198.51.100.78', 'SQL injection attempt detected in query parameters', '/api/v1/search', false);

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Mock data insertion failed: %', SQLERRM;
END $$;

-- 11. Create comments for documentation
COMMENT ON TABLE public.api_access_logs IS 'Tracks all API access requests including endpoints, methods, status codes, and performance metrics';
COMMENT ON TABLE public.security_events IS 'Records security-related events including failed logins, unauthorized access attempts, and suspicious activities';
COMMENT ON VIEW public.unified_audit_trail IS 'Unified view of all audit events across different categories for comprehensive audit trail reporting';
COMMENT ON FUNCTION public.get_audit_statistics IS 'Returns aggregated audit statistics for compliance reporting and dashboard metrics';