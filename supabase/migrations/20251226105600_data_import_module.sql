-- Location: supabase/migrations/20251226105600_data_import_module.sql
-- Schema Analysis: Existing schema has user_profiles, financial_transactions
-- Integration Type: NEW_MODULE - adding data import functionality
-- Dependencies: user_profiles (existing)

-- 1. Types
CREATE TYPE public.import_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled');
CREATE TYPE public.import_entity_type AS ENUM ('invoices', 'clients', 'expenses');
CREATE TYPE public.client_type AS ENUM ('individual', 'company');
CREATE TYPE public.invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue', 'cancelled');

-- 2. Core Tables

-- Clients table
CREATE TABLE public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    client_type public.client_type NOT NULL DEFAULT 'individual'::public.client_type,
    company_name TEXT,
    first_name TEXT,
    last_name TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    siret TEXT,
    address TEXT,
    postal_code TEXT,
    city TEXT,
    country TEXT DEFAULT 'France',
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_client_name CHECK (
        (client_type = 'company' AND company_name IS NOT NULL) OR
        (client_type = 'individual' AND first_name IS NOT NULL AND last_name IS NOT NULL)
    )
);

-- Invoices table
CREATE TABLE public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    invoice_number TEXT NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status public.invoice_status DEFAULT 'draft'::public.invoice_status,
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    tax_rate DECIMAL(5,2) NOT NULL DEFAULT 20.00,
    tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    currency TEXT DEFAULT 'EUR',
    description TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_invoice_number_per_user UNIQUE(user_id, invoice_number)
);

-- Data imports tracking table
CREATE TABLE public.data_imports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    entity_type public.import_entity_type NOT NULL,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    total_rows INTEGER,
    successful_rows INTEGER DEFAULT 0,
    failed_rows INTEGER DEFAULT 0,
    status public.import_status DEFAULT 'pending'::public.import_status,
    error_log JSONB,
    field_mapping JSONB,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Indexes
CREATE INDEX idx_clients_user_id ON public.clients(user_id);
CREATE INDEX idx_clients_email ON public.clients(email);
CREATE INDEX idx_clients_siret ON public.clients(siret) WHERE siret IS NOT NULL;
CREATE INDEX idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX idx_invoices_client_id ON public.invoices(client_id);
CREATE INDEX idx_invoices_invoice_number ON public.invoices(invoice_number);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_data_imports_user_id ON public.data_imports(user_id);
CREATE INDEX idx_data_imports_status ON public.data_imports(status);
CREATE INDEX idx_data_imports_entity_type ON public.data_imports(entity_type);

-- 4. Functions
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $func$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$func$;

-- 5. Triggers
CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON public.clients
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_invoices_updated_at
    BEFORE UPDATE ON public.invoices
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_data_imports_updated_at
    BEFORE UPDATE ON public.data_imports
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 6. Storage Bucket for uploaded files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'data-imports',
    'data-imports',
    false,
    10485760,
    ARRAY['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
);

-- 7. Enable RLS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_imports ENABLE ROW LEVEL SECURITY;

-- 8. RLS Policies

-- Clients policies (Pattern 2: Simple User Ownership)
CREATE POLICY "users_manage_own_clients"
ON public.clients
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Invoices policies (Pattern 2: Simple User Ownership)
CREATE POLICY "users_manage_own_invoices"
ON public.invoices
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Data imports policies (Pattern 2: Simple User Ownership)
CREATE POLICY "users_manage_own_data_imports"
ON public.data_imports
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Storage policies for data-imports bucket
CREATE POLICY "users_manage_own_import_files"
ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'data-imports' AND owner = auth.uid())
WITH CHECK (bucket_id = 'data-imports' AND owner = auth.uid());

-- 9. Mock Data
DO $$
DECLARE
    existing_user_id UUID;
    client1_id UUID := gen_random_uuid();
    client2_id UUID := gen_random_uuid();
BEGIN
    -- Get existing user
    SELECT id INTO existing_user_id FROM public.user_profiles LIMIT 1;
    
    IF existing_user_id IS NOT NULL THEN
        -- Create sample clients with proper data
        INSERT INTO public.clients (id, user_id, client_type, company_name, first_name, last_name, email, phone, siret, address, city, postal_code)
        VALUES
            (client1_id, existing_user_id, 'company', 'Tech Solutions SARL', NULL, NULL, 'contact@techsolutions.fr', '+33142123456', '12345678901234', '15 Rue de la Tech', 'Paris', '75001'),
            (client2_id, existing_user_id, 'individual', NULL, 'Jean', 'Dupont', 'jean.dupont@email.fr', '+33143654321', NULL, '42 Avenue des Champs', 'Lyon', '69001');
        
        -- Create sample invoices
        INSERT INTO public.invoices (user_id, client_id, invoice_number, issue_date, due_date, status, subtotal, tax_rate, tax_amount, total_amount)
        VALUES
            (existing_user_id, client1_id, 'INV-2025-001', '2025-01-15', '2025-02-15', 'sent', 5000.00, 20.00, 1000.00, 6000.00),
            (existing_user_id, client2_id, 'INV-2025-002', '2025-01-20', '2025-02-20', 'draft', 2500.00, 20.00, 500.00, 3000.00);
    END IF;
END $$;