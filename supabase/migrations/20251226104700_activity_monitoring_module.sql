-- Location: supabase/migrations/20251226104700_activity_monitoring_module.sql
-- Schema Analysis: Existing tables: user_profiles, subscription_plans, user_subscriptions
-- Integration Type: addition
-- Dependencies: user_profiles (for user relationships)

-- 1. Create ENUM types for activity monitoring
CREATE TYPE public.activity_type AS ENUM (
    'invoice_created',
    'invoice_updated',
    'invoice_deleted',
    'expense_created',
    'expense_updated',
    'expense_deleted',
    'client_created',
    'client_updated',
    'client_deleted',
    'payment_received',
    'tax_declaration_filed',
    'report_generated',
    'user_login',
    'user_logout',
    'settings_changed'
);

CREATE TYPE public.user_status AS ENUM ('active', 'idle', 'away', 'offline');

CREATE TYPE public.edit_status AS ENUM ('draft', 'in_progress', 'completed', 'cancelled');

-- 2. Core tables for activity monitoring
CREATE TABLE public.active_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    status public.user_status DEFAULT 'active'::public.user_status,
    current_screen TEXT NOT NULL,
    last_activity TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    session_started TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.document_edits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    document_id TEXT NOT NULL,
    document_title TEXT NOT NULL,
    edit_status public.edit_status DEFAULT 'in_progress'::public.edit_status,
    started_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    last_modified TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    changes_count INTEGER DEFAULT 0,
    is_concurrent BOOLEAN DEFAULT false,
    concurrent_users JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    activity_type public.activity_type NOT NULL,
    description TEXT NOT NULL,
    module TEXT NOT NULL,
    entity_type TEXT,
    entity_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.change_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    entity_title TEXT NOT NULL,
    action TEXT NOT NULL,
    field_changed TEXT,
    old_value JSONB,
    new_value JSONB,
    change_reason TEXT,
    can_rollback BOOLEAN DEFAULT false,
    is_critical BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Essential Indexes
CREATE INDEX idx_active_sessions_user_id ON public.active_sessions(user_id);
CREATE INDEX idx_active_sessions_status ON public.active_sessions(status);
CREATE INDEX idx_active_sessions_last_activity ON public.active_sessions(last_activity DESC);

CREATE INDEX idx_document_edits_user_id ON public.document_edits(user_id);
CREATE INDEX idx_document_edits_document_type ON public.document_edits(document_type);
CREATE INDEX idx_document_edits_status ON public.document_edits(edit_status);
CREATE INDEX idx_document_edits_last_modified ON public.document_edits(last_modified DESC);

CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_type ON public.activity_logs(activity_type);
CREATE INDEX idx_activity_logs_module ON public.activity_logs(module);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at DESC);

CREATE INDEX idx_change_history_user_id ON public.change_history(user_id);
CREATE INDEX idx_change_history_entity ON public.change_history(entity_type, entity_id);
CREATE INDEX idx_change_history_created_at ON public.change_history(created_at DESC);
CREATE INDEX idx_change_history_critical ON public.change_history(is_critical);

-- 4. Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- 5. Triggers for automatic timestamp updates
CREATE TRIGGER set_updated_at_active_sessions
    BEFORE UPDATE ON public.active_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_document_edits
    BEFORE UPDATE ON public.document_edits
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 6. Enable RLS
ALTER TABLE public.active_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_edits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.change_history ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies - Using Pattern 2 (Simple User Ownership) and Pattern 6 (Role-Based)

-- Active sessions - users can view all, manage own
CREATE POLICY "users_view_all_sessions"
ON public.active_sessions
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "users_manage_own_sessions"
ON public.active_sessions
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Document edits - users can view all, manage own
CREATE POLICY "users_view_all_edits"
ON public.document_edits
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "users_manage_own_edits"
ON public.document_edits
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Activity logs - users can view all, create own
CREATE POLICY "users_view_all_activities"
ON public.activity_logs
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "users_create_own_activities"
ON public.activity_logs
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Change history - users can view all, create own
CREATE POLICY "users_view_all_history"
ON public.change_history
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "users_create_own_history"
ON public.change_history
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- 8. Mock Data
DO $$
DECLARE
    existing_user_id UUID;
    session_id_1 UUID := gen_random_uuid();
    session_id_2 UUID := gen_random_uuid();
    edit_id_1 UUID := gen_random_uuid();
    edit_id_2 UUID := gen_random_uuid();
BEGIN
    -- Get existing user ID from user_profiles
    SELECT id INTO existing_user_id FROM public.user_profiles LIMIT 1;
    
    IF existing_user_id IS NOT NULL THEN
        -- Create active sessions
        INSERT INTO public.active_sessions (id, user_id, status, current_screen, last_activity)
        VALUES
            (session_id_1, existing_user_id, 'active'::public.user_status, '/invoice-management', NOW()),
            (session_id_2, existing_user_id, 'idle'::public.user_status, '/dashboard', NOW() - INTERVAL '5 minutes');
        
        -- Create document edits
        INSERT INTO public.document_edits (id, user_id, document_type, document_id, document_title, edit_status, changes_count)
        VALUES
            (edit_id_1, existing_user_id, 'invoice', 'INV-2025-001', 'Facture Client ABC - Janvier 2025', 'in_progress'::public.edit_status, 3),
            (edit_id_2, existing_user_id, 'expense', 'EXP-2025-042', 'Fournitures Bureau - Décembre 2024', 'draft'::public.edit_status, 1);
        
        -- Create activity logs
        INSERT INTO public.activity_logs (user_id, activity_type, description, module, entity_type, entity_id)
        VALUES
            (existing_user_id, 'invoice_created'::public.activity_type, 'Création nouvelle facture INV-2025-001', 'Facturation', 'invoice', 'INV-2025-001'),
            (existing_user_id, 'expense_updated'::public.activity_type, 'Modification dépense EXP-2025-042', 'Dépenses', 'expense', 'EXP-2025-042'),
            (existing_user_id, 'client_created'::public.activity_type, 'Ajout nouveau client Société XYZ', 'Clients', 'client', 'CLI-123'),
            (existing_user_id, 'user_login'::public.activity_type, 'Connexion utilisateur', 'Authentification', NULL, NULL);
        
        -- Create change history
        INSERT INTO public.change_history (user_id, entity_type, entity_id, entity_title, action, field_changed, old_value, new_value, can_rollback)
        VALUES
            (existing_user_id, 'invoice', 'INV-2025-001', 'Facture Client ABC', 'updated', 'montant_ht', '1000.00'::jsonb, '1200.00'::jsonb, true),
            (existing_user_id, 'expense', 'EXP-2025-042', 'Fournitures Bureau', 'updated', 'category', '"Autre"'::jsonb, '"Bureau"'::jsonb, true),
            (existing_user_id, 'client', 'CLI-123', 'Société XYZ', 'created', NULL, NULL, '{"name": "Société XYZ", "siret": "12345678901234"}'::jsonb, false);
    ELSE
        RAISE NOTICE 'No existing users found. Please ensure user_profiles table has data.';
    END IF;
END $$;