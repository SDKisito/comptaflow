-- Location: supabase/migrations/20251226113122_webhook_management_module.sql
-- Schema Analysis: Existing schema with user_profiles, activity_logs
-- Integration Type: New module addition
-- Dependencies: user_profiles

-- 1. ENUMS AND TYPES
CREATE TYPE public.webhook_status AS ENUM ('active', 'inactive', 'disabled', 'error');
CREATE TYPE public.webhook_auth_method AS ENUM ('hmac_sha256', 'bearer_token', 'basic_auth', 'none');
CREATE TYPE public.event_category AS ENUM ('invoice', 'payment', 'client', 'expense', 'subscription', 'user', 'system');
CREATE TYPE public.delivery_status AS ENUM ('pending', 'success', 'failed', 'retrying');

-- 2. CORE TABLES

-- Webhook endpoints table
CREATE TABLE public.webhook_endpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    endpoint_name TEXT NOT NULL,
    url TEXT NOT NULL,
    auth_method public.webhook_auth_method DEFAULT 'none'::public.webhook_auth_method,
    auth_secret TEXT,
    is_active BOOLEAN DEFAULT true,
    retry_policy JSONB DEFAULT '{"max_retries": 3, "retry_delay_seconds": 60}'::jsonb,
    ip_whitelist TEXT[],
    ssl_verify BOOLEAN DEFAULT true,
    rate_limit_per_minute INTEGER DEFAULT 60,
    last_delivery_at TIMESTAMPTZ,
    last_success_at TIMESTAMPTZ,
    last_error_at TIMESTAMPTZ,
    total_deliveries INTEGER DEFAULT 0,
    successful_deliveries INTEGER DEFAULT 0,
    failed_deliveries INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Webhook events catalog
CREATE TABLE public.webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_code TEXT NOT NULL UNIQUE,
    event_name TEXT NOT NULL,
    event_category public.event_category NOT NULL,
    description TEXT,
    payload_schema JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- User event subscriptions
CREATE TABLE public.webhook_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    endpoint_id UUID REFERENCES public.webhook_endpoints(id) ON DELETE CASCADE NOT NULL,
    event_code TEXT REFERENCES public.webhook_events(event_code) ON DELETE CASCADE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    filters JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(endpoint_id, event_code)
);

-- Delivery logs
CREATE TABLE public.webhook_delivery_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    endpoint_id UUID REFERENCES public.webhook_endpoints(id) ON DELETE CASCADE NOT NULL,
    event_code TEXT REFERENCES public.webhook_events(event_code) ON DELETE CASCADE NOT NULL,
    delivery_status public.delivery_status DEFAULT 'pending'::public.delivery_status,
    http_status_code INTEGER,
    request_payload JSONB,
    response_body TEXT,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    delivery_duration_ms INTEGER,
    delivered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. INDEXES
CREATE INDEX idx_webhook_endpoints_user_id ON public.webhook_endpoints(user_id);
CREATE INDEX idx_webhook_endpoints_is_active ON public.webhook_endpoints(is_active);
CREATE INDEX idx_webhook_events_category ON public.webhook_events(event_category);
CREATE INDEX idx_webhook_events_is_active ON public.webhook_events(is_active);
CREATE INDEX idx_webhook_subscriptions_user_id ON public.webhook_subscriptions(user_id);
CREATE INDEX idx_webhook_subscriptions_endpoint_id ON public.webhook_subscriptions(endpoint_id);
CREATE INDEX idx_webhook_subscriptions_event_code ON public.webhook_subscriptions(event_code);
CREATE INDEX idx_webhook_delivery_logs_endpoint_id ON public.webhook_delivery_logs(endpoint_id);
CREATE INDEX idx_webhook_delivery_logs_status ON public.webhook_delivery_logs(delivery_status);
CREATE INDEX idx_webhook_delivery_logs_created_at ON public.webhook_delivery_logs(created_at);

-- 4. FUNCTIONS
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_endpoint_delivery_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE public.webhook_endpoints
    SET 
        total_deliveries = total_deliveries + 1,
        successful_deliveries = CASE WHEN NEW.delivery_status = 'success'::public.delivery_status 
                                    THEN successful_deliveries + 1 
                                    ELSE successful_deliveries END,
        failed_deliveries = CASE WHEN NEW.delivery_status = 'failed'::public.delivery_status 
                                THEN failed_deliveries + 1 
                                ELSE failed_deliveries END,
        last_delivery_at = CURRENT_TIMESTAMP,
        last_success_at = CASE WHEN NEW.delivery_status = 'success'::public.delivery_status 
                            THEN CURRENT_TIMESTAMP 
                            ELSE last_success_at END,
        last_error_at = CASE WHEN NEW.delivery_status = 'failed'::public.delivery_status 
                        THEN CURRENT_TIMESTAMP 
                        ELSE last_error_at END
    WHERE id = NEW.endpoint_id;
    RETURN NEW;
END;
$$;

-- 5. RLS SETUP
ALTER TABLE public.webhook_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_delivery_logs ENABLE ROW LEVEL SECURITY;

-- 6. RLS POLICIES

-- Webhook endpoints policies
CREATE POLICY "users_manage_own_webhook_endpoints"
ON public.webhook_endpoints
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Webhook events policies (public read, admin manage)
CREATE POLICY "public_can_read_webhook_events"
ON public.webhook_events
FOR SELECT
TO public
USING (is_active = true);

CREATE POLICY "authenticated_users_can_read_all_webhook_events"
ON public.webhook_events
FOR SELECT
TO authenticated
USING (true);

-- Webhook subscriptions policies
CREATE POLICY "users_manage_own_webhook_subscriptions"
ON public.webhook_subscriptions
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Webhook delivery logs policies
CREATE POLICY "users_view_own_delivery_logs"
ON public.webhook_delivery_logs
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.webhook_endpoints we
        WHERE we.id = webhook_delivery_logs.endpoint_id
        AND we.user_id = auth.uid()
    )
);

-- 7. TRIGGERS
CREATE TRIGGER update_webhook_endpoints_timestamp
    BEFORE UPDATE ON public.webhook_endpoints
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_webhook_subscriptions_timestamp
    BEFORE UPDATE ON public.webhook_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_endpoint_stats_on_delivery
    AFTER INSERT ON public.webhook_delivery_logs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_endpoint_delivery_stats();

-- 8. MOCK DATA
DO $$
DECLARE
    existing_user_id UUID;
    endpoint1_id UUID := gen_random_uuid();
    endpoint2_id UUID := gen_random_uuid();
    invoice_event_code TEXT := 'invoice.created';
    payment_event_code TEXT := 'payment.received';
BEGIN
    -- Get existing user ID from user_profiles
    SELECT id INTO existing_user_id FROM public.user_profiles LIMIT 1;
    
    IF existing_user_id IS NULL THEN
        RAISE NOTICE 'No existing users found. Skipping webhook mock data.';
        RETURN;
    END IF;
    
    -- Insert webhook events catalog
    INSERT INTO public.webhook_events (event_code, event_name, event_category, description, payload_schema) VALUES
        ('invoice.created', 'Invoice Created', 'invoice'::public.event_category, 'Triggered when a new invoice is created', '{"invoice_id": "uuid", "client_id": "uuid", "amount": "number"}'::jsonb),
        ('invoice.updated', 'Invoice Updated', 'invoice'::public.event_category, 'Triggered when an invoice is updated', '{"invoice_id": "uuid", "changes": "object"}'::jsonb),
        ('invoice.paid', 'Invoice Paid', 'invoice'::public.event_category, 'Triggered when an invoice is paid', '{"invoice_id": "uuid", "payment_id": "uuid"}'::jsonb),
        ('payment.received', 'Payment Received', 'payment'::public.event_category, 'Triggered when a payment is received', '{"payment_id": "uuid", "amount": "number"}'::jsonb),
        ('payment.failed', 'Payment Failed', 'payment'::public.event_category, 'Triggered when a payment fails', '{"payment_id": "uuid", "error": "string"}'::jsonb),
        ('client.created', 'Client Created', 'client'::public.event_category, 'Triggered when a new client is created', '{"client_id": "uuid", "name": "string"}'::jsonb),
        ('expense.created', 'Expense Created', 'expense'::public.event_category, 'Triggered when a new expense is created', '{"expense_id": "uuid", "amount": "number"}'::jsonb),
        ('subscription.started', 'Subscription Started', 'subscription'::public.event_category, 'Triggered when a subscription starts', '{"subscription_id": "uuid", "plan": "string"}'::jsonb);
    
    -- Insert sample webhook endpoints
    INSERT INTO public.webhook_endpoints (id, user_id, endpoint_name, url, auth_method, auth_secret, is_active, total_deliveries, successful_deliveries) VALUES
        (endpoint1_id, existing_user_id, 'Production API', 'https://api.example.com/webhooks', 'hmac_sha256'::public.webhook_auth_method, 'secret_key_123', true, 45, 42),
        (endpoint2_id, existing_user_id, 'Development Endpoint', 'https://dev.example.com/hooks', 'bearer_token'::public.webhook_auth_method, 'bearer_token_xyz', true, 12, 10);
    
    -- Insert sample subscriptions
    INSERT INTO public.webhook_subscriptions (user_id, endpoint_id, event_code, is_active) VALUES
        (existing_user_id, endpoint1_id, invoice_event_code, true),
        (existing_user_id, endpoint1_id, payment_event_code, true),
        (existing_user_id, endpoint2_id, invoice_event_code, true);
    
    -- Insert sample delivery logs
    INSERT INTO public.webhook_delivery_logs (endpoint_id, event_code, delivery_status, http_status_code, request_payload, response_body, delivery_duration_ms, delivered_at) VALUES
        (endpoint1_id, invoice_event_code, 'success'::public.delivery_status, 200, '{"invoice_id": "123", "amount": 1500}'::jsonb, 'OK', 125, CURRENT_TIMESTAMP - INTERVAL '5 minutes'),
        (endpoint1_id, payment_event_code, 'success'::public.delivery_status, 200, '{"payment_id": "456", "amount": 1500}'::jsonb, 'OK', 98, CURRENT_TIMESTAMP - INTERVAL '2 minutes'),
        (endpoint2_id, invoice_event_code, 'failed'::public.delivery_status, 500, '{"invoice_id": "789", "amount": 2000}'::jsonb, 'Internal Server Error', 1523, CURRENT_TIMESTAMP - INTERVAL '1 hour');

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Mock data creation failed: %', SQLERRM;
END $$;