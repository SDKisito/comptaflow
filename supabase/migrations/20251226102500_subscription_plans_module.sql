-- Location: supabase/migrations/20251226102500_subscription_plans_module.sql
-- Schema Analysis: Existing user_profiles has subscription_status and subscription_end_date
-- Integration Type: Addition - New subscription_plans table
-- Dependencies: user_profiles (existing)

-- 1. Create subscription_plans table (catalog of available plans)
CREATE TABLE public.subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_name TEXT NOT NULL UNIQUE,
    plan_code TEXT NOT NULL UNIQUE,
    price_monthly DECIMAL(10,2) NOT NULL,
    price_annual DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'EUR',
    max_clients INTEGER,
    max_invoices_per_month INTEGER,
    max_documents_storage_gb INTEGER,
    features JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create indexes for subscription_plans
CREATE INDEX idx_subscription_plans_plan_code ON public.subscription_plans(plan_code);
CREATE INDEX idx_subscription_plans_is_active ON public.subscription_plans(is_active);
CREATE INDEX idx_subscription_plans_display_order ON public.subscription_plans(display_order);

-- 3. Create user_subscriptions table (links users to plans)
CREATE TABLE public.user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES public.subscription_plans(id) ON DELETE RESTRICT,
    billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'annual')) DEFAULT 'monthly',
    subscription_start_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    subscription_end_date TIMESTAMPTZ,
    auto_renew BOOLEAN DEFAULT true,
    payment_method TEXT,
    last_payment_date TIMESTAMPTZ,
    next_payment_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create indexes for user_subscriptions
CREATE INDEX idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_plan_id ON public.user_subscriptions(plan_id);
CREATE INDEX idx_user_subscriptions_subscription_end_date ON public.user_subscriptions(subscription_end_date);

-- 5. Enable RLS
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for subscription_plans (public read)
CREATE POLICY "public_can_view_active_subscription_plans"
ON public.subscription_plans
FOR SELECT
TO public
USING (is_active = true);

-- 7. RLS Policies for user_subscriptions (user ownership)
CREATE POLICY "users_view_own_user_subscriptions"
ON public.user_subscriptions
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "users_create_own_user_subscriptions"
ON public.user_subscriptions
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_update_own_user_subscriptions"
ON public.user_subscriptions
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 8. Create trigger for updated_at
CREATE TRIGGER on_subscription_plan_updated
BEFORE UPDATE ON public.subscription_plans
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_user_subscription_updated
BEFORE UPDATE ON public.user_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- 9. Insert mock subscription plans (French market pricing)
INSERT INTO public.subscription_plans (
    plan_name, plan_code, price_monthly, price_annual, 
    max_clients, max_invoices_per_month, max_documents_storage_gb,
    features, display_order
) VALUES
(
    'Starter',
    'starter',
    25.00,
    250.00,
    10,
    50,
    5,
    '["Gestion de 10 clients maximum", "50 factures par mois", "5 Go de stockage", "Gestion TVA standard", "Support par email", "Export PDF basique", "Tableau de bord simplifié"]'::jsonb,
    1
),
(
    'Pro',
    'pro',
    45.00,
    450.00,
    50,
    200,
    20,
    '["Gestion de 50 clients", "200 factures par mois", "20 Go de stockage", "Gestion TVA avancée", "Support prioritaire", "Exports multiples (PDF, Excel)", "Rapports détaillés", "Intégration URSSAF", "API access"]'::jsonb,
    2
),
(
    'Expert',
    'expert',
    75.00,
    750.00,
    -1,
    -1,
    100,
    '["Clients illimités", "Factures illimitées", "100 Go de stockage", "Gestion TVA complète", "Support téléphonique dédié", "Tous les exports disponibles", "Rapports personnalisés", "Intégration URSSAF complète", "API accès complet", "Multi-utilisateurs", "Conformité expert-comptable"]'::jsonb,
    3
);

-- 10. Create sample user subscription for existing users
DO $$
DECLARE
    existing_user_id UUID;
    starter_plan_id UUID;
BEGIN
    -- Get an existing user
    SELECT id INTO existing_user_id FROM public.user_profiles LIMIT 1;
    
    -- Get starter plan
    SELECT id INTO starter_plan_id FROM public.subscription_plans WHERE plan_code = 'starter' LIMIT 1;
    
    -- Only create if user exists
    IF existing_user_id IS NOT NULL AND starter_plan_id IS NOT NULL THEN
        INSERT INTO public.user_subscriptions (
            user_id, plan_id, billing_cycle, 
            subscription_start_date, subscription_end_date,
            auto_renew, payment_method
        ) VALUES (
            existing_user_id,
            starter_plan_id,
            'monthly',
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP + INTERVAL '1 month',
            true,
            'carte_bancaire'
        );
    END IF;
END $$;