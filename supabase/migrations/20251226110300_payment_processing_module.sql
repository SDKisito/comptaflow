-- Location: supabase/migrations/20251226110300_payment_processing_module.sql
-- Schema Analysis: Existing invoices, clients, user_profiles tables
-- Integration Type: Extension - Adding payment processing capability to existing invoices
-- Dependencies: invoices, clients, user_profiles tables

-- 1. Create payment status ENUM if not exists
DO $$ BEGIN
    CREATE TYPE public.payment_status AS ENUM ('pending', 'processing', 'succeeded', 'failed', 'cancelled', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 2. Add Stripe customer ID to user_profiles if not exists
DO $$ BEGIN
    ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE;
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

-- 3. Create payments table to track all payment transactions
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
    payment_intent_id TEXT UNIQUE,
    stripe_charge_id TEXT,
    amount NUMERIC(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'EUR',
    status public.payment_status DEFAULT 'pending'::public.payment_status,
    payment_method_type TEXT,
    card_brand TEXT,
    card_last_four TEXT,
    customer_email TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    billing_address JSONB,
    metadata JSONB,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create indexes for payments table
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON public.payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_intent_id ON public.payments(payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON public.payments(created_at DESC);

-- 5. Create payment methods table for saved cards
CREATE TABLE IF NOT EXISTS public.payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    stripe_payment_method_id TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL,
    card_brand TEXT,
    card_last_four TEXT,
    card_exp_month INTEGER,
    card_exp_year INTEGER,
    is_default BOOLEAN DEFAULT false,
    billing_address JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. Create indexes for payment methods table
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON public.payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_stripe_id ON public.payment_methods(stripe_payment_method_id);

-- 7. Add payment_status to invoices if not exists
DO $$ BEGIN
    ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS payment_status public.payment_status DEFAULT 'pending'::public.payment_status;
    ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;
    ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS payment_intent_id TEXT;
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

-- 8. Enable RLS on new tables
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

-- 9. RLS Policies for payments table
CREATE POLICY "users_view_own_payments"
ON public.payments
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "users_create_own_payments"
ON public.payments
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- 10. RLS Policies for payment_methods table
CREATE POLICY "users_manage_own_payment_methods"
ON public.payment_methods
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 11. Create trigger for updated_at on payments
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS update_payments_updated_at ON public.payments;
CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON public.payments
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_payment_methods_updated_at ON public.payment_methods;
CREATE TRIGGER update_payment_methods_updated_at
    BEFORE UPDATE ON public.payment_methods
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 12. Create function to update invoice status after successful payment
CREATE OR REPLACE FUNCTION public.update_invoice_on_payment_success()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'succeeded' AND NEW.invoice_id IS NOT NULL THEN
        UPDATE public.invoices
        SET 
            status = 'paid'::public.invoice_status,
            payment_status = 'succeeded'::public.payment_status,
            paid_at = CURRENT_TIMESTAMP,
            payment_intent_id = NEW.payment_intent_id,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.invoice_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_invoice_on_payment ON public.payments;
CREATE TRIGGER trigger_update_invoice_on_payment
    AFTER INSERT OR UPDATE OF status ON public.payments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_invoice_on_payment_success();