-- Location: supabase/migrations/20251226112024_marketplace_integrations_module.sql
-- Schema Analysis: Existing ComptaFlow schema with user_profiles, invoices, clients, payments
-- Integration Type: NEW_MODULE - Adding marketplace integration capabilities
-- Dependencies: user_profiles (for user_id relationships)

-- 1. Create ENUM types for marketplace
CREATE TYPE public.integration_category AS ENUM (
    'banking',
    'payments',
    'crm',
    'analytics',
    'compliance',
    'tax',
    'inventory',
    'hr',
    'other'
);

CREATE TYPE public.integration_status AS ENUM (
    'available',
    'connected',
    'disconnected',
    'error',
    'pending'
);

CREATE TYPE public.pricing_model AS ENUM (
    'free',
    'freemium',
    'paid_monthly',
    'paid_annual',
    'usage_based'
);

CREATE TYPE public.compliance_certification AS ENUM (
    'gdpr',
    'french_banking',
    'pci_dss',
    'iso27001',
    'none'
);

-- 2. Core marketplace integrations catalog table
CREATE TABLE public.marketplace_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    provider_name TEXT NOT NULL,
    category public.integration_category NOT NULL,
    logo_url TEXT,
    website_url TEXT,
    documentation_url TEXT,
    pricing_model public.pricing_model DEFAULT 'freemium'::public.pricing_model,
    base_price DECIMAL(10,2),
    currency TEXT DEFAULT 'EUR',
    installation_count INTEGER DEFAULT 0,
    rating DECIMAL(2,1) DEFAULT 0.0,
    review_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    compliance_certifications public.compliance_certification[] DEFAULT ARRAY[]::public.compliance_certification[],
    features JSONB DEFAULT '[]'::jsonb,
    api_endpoint TEXT,
    webhook_url TEXT,
    oauth_config JSONB,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. User integration connections table
CREATE TABLE public.user_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    integration_id UUID NOT NULL REFERENCES public.marketplace_integrations(id) ON DELETE CASCADE,
    status public.integration_status DEFAULT 'pending'::public.integration_status,
    connection_name TEXT,
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMPTZ,
    last_sync_at TIMESTAMPTZ,
    sync_frequency_minutes INTEGER DEFAULT 60,
    auto_sync BOOLEAN DEFAULT true,
    configuration JSONB DEFAULT '{}'::jsonb,
    error_message TEXT,
    error_count INTEGER DEFAULT 0,
    connected_at TIMESTAMPTZ,
    disconnected_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, integration_id)
);

-- 4. Integration sync logs table
CREATE TABLE public.integration_sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_integration_id UUID NOT NULL REFERENCES public.user_integrations(id) ON DELETE CASCADE,
    sync_type TEXT NOT NULL,
    status TEXT NOT NULL,
    records_synced INTEGER DEFAULT 0,
    records_failed INTEGER DEFAULT 0,
    error_details JSONB,
    started_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    duration_seconds INTEGER,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Integration reviews table
CREATE TABLE public.integration_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id UUID NOT NULL REFERENCES public.marketplace_integrations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_title TEXT,
    review_text TEXT,
    is_verified BOOLEAN DEFAULT false,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, integration_id)
);

-- 6. Create indexes for performance
CREATE INDEX idx_marketplace_integrations_category ON public.marketplace_integrations(category);
CREATE INDEX idx_marketplace_integrations_featured ON public.marketplace_integrations(is_featured) WHERE is_featured = true;
CREATE INDEX idx_marketplace_integrations_active ON public.marketplace_integrations(is_active) WHERE is_active = true;
CREATE INDEX idx_marketplace_integrations_rating ON public.marketplace_integrations(rating DESC);

CREATE INDEX idx_user_integrations_user_id ON public.user_integrations(user_id);
CREATE INDEX idx_user_integrations_integration_id ON public.user_integrations(integration_id);
CREATE INDEX idx_user_integrations_status ON public.user_integrations(status);

CREATE INDEX idx_integration_sync_logs_user_integration_id ON public.integration_sync_logs(user_integration_id);
CREATE INDEX idx_integration_sync_logs_created_at ON public.integration_sync_logs(created_at DESC);

CREATE INDEX idx_integration_reviews_integration_id ON public.integration_reviews(integration_id);
CREATE INDEX idx_integration_reviews_rating ON public.integration_reviews(rating);

-- 7. Enable RLS
ALTER TABLE public.marketplace_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_reviews ENABLE ROW LEVEL SECURITY;

-- 8. RLS Policies

-- marketplace_integrations: Public read, admin write
CREATE POLICY "public_can_read_marketplace_integrations"
ON public.marketplace_integrations
FOR SELECT
TO public
USING (is_active = true);

-- user_integrations: Users manage their own integrations
CREATE POLICY "users_manage_own_integrations"
ON public.user_integrations
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- integration_sync_logs: Users view their own sync logs
CREATE POLICY "users_view_own_sync_logs"
ON public.integration_sync_logs
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_integrations ui
        WHERE ui.id = integration_sync_logs.user_integration_id
        AND ui.user_id = auth.uid()
    )
);

-- integration_reviews: Users manage their own reviews, all can read
CREATE POLICY "public_can_read_integration_reviews"
ON public.integration_reviews
FOR SELECT
TO public
USING (true);

CREATE POLICY "users_manage_own_integration_reviews"
ON public.integration_reviews
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 9. Create triggers for updated_at
CREATE TRIGGER update_marketplace_integrations_updated_at
    BEFORE UPDATE ON public.marketplace_integrations
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_user_integrations_updated_at
    BEFORE UPDATE ON public.user_integrations
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_integration_reviews_updated_at
    BEFORE UPDATE ON public.integration_reviews
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 10. Create function to update integration ratings
CREATE OR REPLACE FUNCTION public.update_integration_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.marketplace_integrations
    SET 
        rating = (
            SELECT COALESCE(AVG(rating), 0.0)
            FROM public.integration_reviews
            WHERE integration_id = NEW.integration_id
        ),
        review_count = (
            SELECT COUNT(*)
            FROM public.integration_reviews
            WHERE integration_id = NEW.integration_id
        )
    WHERE id = NEW.integration_id;
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_integration_rating
    AFTER INSERT OR UPDATE OR DELETE ON public.integration_reviews
    FOR EACH ROW
    EXECUTE FUNCTION public.update_integration_rating();

-- 11. Mock data for marketplace integrations
DO $$
DECLARE
    stripe_id UUID := gen_random_uuid();
    paypal_id UUID := gen_random_uuid();
    ca_id UUID := gen_random_uuid();
    bnp_id UUID := gen_random_uuid();
    hubspot_id UUID := gen_random_uuid();
    salesforce_id UUID := gen_random_uuid();
    sage_id UUID := gen_random_uuid();
    qonto_id UUID := gen_random_uuid();
    existing_user_id UUID;
BEGIN
    -- Get first existing user for mock reviews
    SELECT id INTO existing_user_id FROM public.user_profiles LIMIT 1;

    -- Insert popular French business integrations
    INSERT INTO public.marketplace_integrations (
        id, name, description, provider_name, category, pricing_model, 
        base_price, installation_count, rating, review_count, is_featured,
        compliance_certifications, features
    ) VALUES
    (
        stripe_id,
        'Stripe Payment Gateway',
        'Processeur de paiement en ligne sécurisé pour accepter les cartes bancaires et les paiements électroniques. Intégration complète avec facturation automatique.',
        'Stripe',
        'payments'::public.integration_category,
        'usage_based'::public.pricing_model,
        0.00,
        12847,
        4.8,
        2563,
        true,
        ARRAY['gdpr'::public.compliance_certification, 'pci_dss'::public.compliance_certification],
        '["Paiements par carte", "Facturation récurrente", "API REST complète", "Tableau de bord analytique"]'::jsonb
    ),
    (
        paypal_id,
        'PayPal Business',
        'Solution de paiement internationale permettant d''accepter les paiements PayPal, cartes bancaires et virements. Idéal pour le commerce électronique.',
        'PayPal',
        'payments'::public.integration_category,
        'paid_monthly'::public.pricing_model,
        25.00,
        8945,
        4.5,
        1847,
        true,
        ARRAY['gdpr'::public.compliance_certification, 'pci_dss'::public.compliance_certification],
        '["Paiements internationaux", "Protection acheteur/vendeur", "Facturation en ligne", "Multi-devises"]'::jsonb
    ),
    (
        ca_id,
        'Crédit Agricole API Banking',
        'Connexion bancaire directe avec Crédit Agricole pour la synchronisation automatique des transactions et la consultation des comptes en temps réel.',
        'Crédit Agricole',
        'banking'::public.integration_category,
        'free'::public.pricing_model,
        0.00,
        5632,
        4.2,
        892,
        true,
        ARRAY['gdpr'::public.compliance_certification, 'french_banking'::public.compliance_certification],
        '["Synchronisation automatique", "Consultation multi-comptes", "Catégorisation des transactions", "Conformité DSP2"]'::jsonb
    ),
    (
        bnp_id,
        'BNP Paribas Open Banking',
        'Intégration bancaire BNP Paribas permettant l''accès sécurisé aux données bancaires et l''initiation de paiements via API.',
        'BNP Paribas',
        'banking'::public.integration_category,
        'freemium'::public.pricing_model,
        15.00,
        4521,
        4.3,
        678,
        false,
        ARRAY['gdpr'::public.compliance_certification, 'french_banking'::public.compliance_certification],
        '["Accès compte en temps réel", "Initiation de paiements", "Historique des transactions", "Alertes personnalisées"]'::jsonb
    ),
    (
        hubspot_id,
        'HubSpot CRM',
        'Plateforme CRM complète pour gérer vos contacts clients, opportunités commerciales et campagnes marketing avec synchronisation bidirectionnelle.',
        'HubSpot',
        'crm'::public.integration_category,
        'freemium'::public.pricing_model,
        45.00,
        9876,
        4.7,
        3241,
        true,
        ARRAY['gdpr'::public.compliance_certification, 'iso27001'::public.compliance_certification],
        '["Gestion des contacts", "Pipeline des ventes", "Automatisation marketing", "Reporting avancé"]'::jsonb
    ),
    (
        salesforce_id,
        'Salesforce',
        'Solution CRM d''entreprise leader mondial offrant une vue complète de vos clients et une automatisation avancée des processus commerciaux.',
        'Salesforce',
        'crm'::public.integration_category,
        'paid_monthly'::public.pricing_model,
        75.00,
        15234,
        4.6,
        4589,
        true,
        ARRAY['gdpr'::public.compliance_certification, 'iso27001'::public.compliance_certification],
        '["CRM complet", "Automatisation des ventes", "Intelligence artificielle", "Personnalisation avancée"]'::jsonb
    ),
    (
        sage_id,
        'Sage Business Cloud',
        'Extension comptable Sage pour synchroniser automatiquement vos écritures comptables et générer vos déclarations fiscales conformément à la législation française.',
        'Sage',
        'compliance'::public.integration_category,
        'paid_monthly'::public.pricing_model,
        35.00,
        6742,
        4.4,
        1523,
        false,
        ARRAY['gdpr'::public.compliance_certification],
        '["Synchronisation comptable", "Déclarations fiscales", "Conformité française", "Export FEC"]'::jsonb
    ),
    (
        qonto_id,
        'Qonto Business Banking',
        'Compte professionnel en ligne français avec cartes de paiement, gestion des dépenses et synchronisation comptable automatique.',
        'Qonto',
        'banking'::public.integration_category,
        'paid_monthly'::public.pricing_model,
        29.00,
        7854,
        4.6,
        2156,
        true,
        ARRAY['gdpr'::public.compliance_certification, 'french_banking'::public.compliance_certification],
        '["Compte pro en ligne", "Cartes virtuelles", "Gestion des notes de frais", "Intégration comptable"]'::jsonb
    );

    -- Add mock reviews if user exists
    IF existing_user_id IS NOT NULL THEN
        INSERT INTO public.integration_reviews (
            integration_id, user_id, rating, review_title, review_text, is_verified
        ) VALUES
        (
            stripe_id,
            existing_user_id,
            5,
            'Excellente intégration de paiement',
            'Stripe est parfaitement intégré à ComptaFlow. La synchronisation des paiements est automatique et les rapports sont très détaillés.',
            true
        ),
        (
            ca_id,
            existing_user_id,
            4,
            'Bonne synchronisation bancaire',
            'La connexion avec mon compte Crédit Agricole fonctionne bien. Quelques petits délais de synchronisation mais rien de critique.',
            true
        );
    END IF;
END $$;