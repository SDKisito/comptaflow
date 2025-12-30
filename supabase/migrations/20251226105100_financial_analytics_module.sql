-- Location: supabase/migrations/20251226105100_financial_analytics_module.sql
-- Schema Analysis: Existing tables (user_profiles, activity_logs, etc.) present
-- Integration Type: NEW_MODULE - Financial analytics extension
-- Dependencies: user_profiles

-- ============================================================
-- 1. ENUMS & TYPES
-- ============================================================

CREATE TYPE public.transaction_type AS ENUM ('invoice', 'expense', 'payment', 'refund', 'adjustment');
CREATE TYPE public.transaction_category AS ENUM ('revenue', 'cost_of_goods', 'operating_expense', 'financial', 'tax', 'other');
CREATE TYPE public.budget_period AS ENUM ('monthly', 'quarterly', 'annual');
CREATE TYPE public.forecast_confidence AS ENUM ('low', 'medium', 'high');
CREATE TYPE public.trend_direction AS ENUM ('increasing', 'decreasing', 'stable', 'volatile');

-- ============================================================
-- 2. CORE TABLES
-- ============================================================

-- Financial Transactions (historical data for all financial activities)
CREATE TABLE public.financial_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    
    -- Transaction details
    transaction_type public.transaction_type NOT NULL,
    transaction_category public.transaction_category NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    currency TEXT DEFAULT 'EUR',
    transaction_date DATE NOT NULL,
    description TEXT,
    
    -- Classification
    account_number TEXT,
    reference_number TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT positive_amount CHECK (amount > 0)
);

-- Budget Plans (budget targets by category and period)
CREATE TABLE public.budget_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    
    -- Budget details
    budget_name TEXT NOT NULL,
    budget_period public.budget_period NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    
    -- Budget categories with targets
    category public.transaction_category NOT NULL,
    planned_amount DECIMAL(15, 2) NOT NULL,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT valid_date_range CHECK (end_date > start_date),
    CONSTRAINT positive_planned_amount CHECK (planned_amount >= 0)
);

-- Cash Flow Forecasts (predictive cash flow projections)
CREATE TABLE public.cash_flow_forecasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    
    -- Forecast details
    forecast_date DATE NOT NULL,
    forecast_period TEXT NOT NULL, -- e.g., '2025-01', 'Q1-2025'
    
    -- Projections
    projected_revenue DECIMAL(15, 2) NOT NULL DEFAULT 0,
    projected_expenses DECIMAL(15, 2) NOT NULL DEFAULT 0,
    projected_net_flow DECIMAL(15, 2) NOT NULL DEFAULT 0,
    opening_balance DECIMAL(15, 2) NOT NULL DEFAULT 0,
    closing_balance DECIMAL(15, 2) NOT NULL DEFAULT 0,
    
    -- Confidence and methodology
    confidence_level public.forecast_confidence NOT NULL,
    methodology TEXT, -- e.g., 'moving_average', 'exponential_smoothing', 'regression'
    
    -- Actual vs Forecast (filled in after period ends)
    actual_revenue DECIMAL(15, 2),
    actual_expenses DECIMAL(15, 2),
    actual_net_flow DECIMAL(15, 2),
    variance_percentage DECIMAL(5, 2), -- percentage difference between forecast and actual
    
    -- Metadata
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Financial Trends (analyzed patterns and insights)
CREATE TABLE public.financial_trends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    
    -- Trend identification
    trend_type TEXT NOT NULL, -- e.g., 'revenue_growth', 'expense_pattern', 'seasonality'
    category public.transaction_category,
    
    -- Period analysis
    analysis_start_date DATE NOT NULL,
    analysis_end_date DATE NOT NULL,
    
    -- Trend metrics
    trend_direction public.trend_direction NOT NULL,
    growth_rate DECIMAL(10, 2), -- percentage
    average_value DECIMAL(15, 2),
    volatility_score DECIMAL(5, 2), -- standard deviation as percentage
    
    -- Insights
    description TEXT,
    recommendations JSONB DEFAULT '[]',
    
    -- Metadata
    calculated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT valid_analysis_period CHECK (analysis_end_date > analysis_start_date)
);

-- ============================================================
-- 3. INDEXES
-- ============================================================

-- Financial Transactions indexes
CREATE INDEX idx_financial_transactions_user_id ON public.financial_transactions(user_id);
CREATE INDEX idx_financial_transactions_date ON public.financial_transactions(transaction_date);
CREATE INDEX idx_financial_transactions_type ON public.financial_transactions(transaction_type);
CREATE INDEX idx_financial_transactions_category ON public.financial_transactions(transaction_category);
CREATE INDEX idx_financial_transactions_user_date ON public.financial_transactions(user_id, transaction_date DESC);

-- Budget Plans indexes
CREATE INDEX idx_budget_plans_user_id ON public.budget_plans(user_id);
CREATE INDEX idx_budget_plans_period ON public.budget_plans(start_date, end_date);
CREATE INDEX idx_budget_plans_active ON public.budget_plans(is_active) WHERE is_active = true;

-- Cash Flow Forecasts indexes
CREATE INDEX idx_cash_flow_forecasts_user_id ON public.cash_flow_forecasts(user_id);
CREATE INDEX idx_cash_flow_forecasts_date ON public.cash_flow_forecasts(forecast_date);
CREATE INDEX idx_cash_flow_forecasts_period ON public.cash_flow_forecasts(forecast_period);

-- Financial Trends indexes
CREATE INDEX idx_financial_trends_user_id ON public.financial_trends(user_id);
CREATE INDEX idx_financial_trends_type ON public.financial_trends(trend_type);
CREATE INDEX idx_financial_trends_period ON public.financial_trends(analysis_start_date, analysis_end_date);

-- ============================================================
-- 4. FUNCTIONS
-- ============================================================

-- Function to calculate budget variance
CREATE OR REPLACE FUNCTION public.calculate_budget_variance(
    budget_plan_uuid UUID,
    actual_start_date DATE,
    actual_end_date DATE
)
RETURNS TABLE(
    category TEXT,
    planned_amount DECIMAL,
    actual_amount DECIMAL,
    variance_amount DECIMAL,
    variance_percentage DECIMAL
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT 
        bp.category::TEXT,
        bp.planned_amount,
        COALESCE(SUM(ft.amount), 0) as actual_amount,
        bp.planned_amount - COALESCE(SUM(ft.amount), 0) as variance_amount,
        CASE 
            WHEN bp.planned_amount > 0 THEN 
                ((bp.planned_amount - COALESCE(SUM(ft.amount), 0)) / bp.planned_amount * 100)
            ELSE 0
        END as variance_percentage
    FROM public.budget_plans bp
    LEFT JOIN public.financial_transactions ft 
        ON ft.user_id = bp.user_id 
        AND ft.transaction_category = bp.category
        AND ft.transaction_date BETWEEN actual_start_date AND actual_end_date
    WHERE bp.id = budget_plan_uuid
    GROUP BY bp.category, bp.planned_amount;
$$;

-- Function to generate cash flow forecast based on historical data
CREATE OR REPLACE FUNCTION public.generate_cash_flow_forecast(
    target_user_id UUID,
    forecast_months INTEGER DEFAULT 3
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_month DATE;
    avg_revenue DECIMAL(15, 2);
    avg_expenses DECIMAL(15, 2);
    last_balance DECIMAL(15, 2);
    month_counter INTEGER;
BEGIN
    -- Get average revenue and expenses from last 6 months
    SELECT 
        COALESCE(AVG(CASE WHEN transaction_category = 'revenue' THEN amount ELSE 0 END), 0),
        COALESCE(AVG(CASE WHEN transaction_category != 'revenue' THEN amount ELSE 0 END), 0)
    INTO avg_revenue, avg_expenses
    FROM public.financial_transactions
    WHERE user_id = target_user_id
        AND transaction_date >= CURRENT_DATE - INTERVAL '6 months';
    
    -- Get last known balance (from most recent forecast or calculate from transactions)
    SELECT closing_balance INTO last_balance
    FROM public.cash_flow_forecasts
    WHERE user_id = target_user_id
    ORDER BY forecast_date DESC
    LIMIT 1;
    
    -- If no previous forecast, calculate from transactions
    IF last_balance IS NULL THEN
        SELECT COALESCE(SUM(
            CASE 
                WHEN transaction_category = 'revenue' THEN amount
                ELSE -amount
            END
        ), 0) INTO last_balance
        FROM public.financial_transactions
        WHERE user_id = target_user_id;
    END IF;
    
    -- Ensure last_balance is never NULL
    last_balance := COALESCE(last_balance, 0);
    
    -- Generate forecasts for next N months
    FOR month_counter IN 1..forecast_months LOOP
        current_month := DATE_TRUNC('month', CURRENT_DATE) + (month_counter || ' month')::INTERVAL;
        
        INSERT INTO public.cash_flow_forecasts (
            user_id,
            forecast_date,
            forecast_period,
            projected_revenue,
            projected_expenses,
            projected_net_flow,
            opening_balance,
            closing_balance,
            confidence_level,
            methodology
        ) VALUES (
            target_user_id,
            current_month,
            TO_CHAR(current_month, 'YYYY-MM'),
            avg_revenue,
            avg_expenses,
            avg_revenue - avg_expenses,
            last_balance,
            last_balance + (avg_revenue - avg_expenses),
            'medium',
            'moving_average_6m'
        )
        ON CONFLICT DO NOTHING;
        
        -- Update balance for next iteration
        last_balance := last_balance + (avg_revenue - avg_expenses);
    END LOOP;
END;
$$;

-- Function to analyze financial trends
CREATE OR REPLACE FUNCTION public.analyze_financial_trends(
    target_user_id UUID,
    lookback_months INTEGER DEFAULT 12
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    analysis_start DATE;
    analysis_end DATE;
    category_record RECORD;
    avg_amount DECIMAL(15, 2);
    std_dev DECIMAL(15, 2);
    growth_rate_val DECIMAL(10, 2);
    trend_dir public.trend_direction;
BEGIN
    analysis_start := DATE_TRUNC('month', CURRENT_DATE) - (lookback_months || ' months')::INTERVAL;
    analysis_end := CURRENT_DATE;
    
    -- Analyze trends by category
    FOR category_record IN 
        SELECT DISTINCT transaction_category as category
        FROM public.financial_transactions
        WHERE user_id = target_user_id
            AND transaction_date >= analysis_start
    LOOP
        -- Calculate average and volatility
        SELECT 
            AVG(amount),
            STDDEV(amount)
        INTO avg_amount, std_dev
        FROM public.financial_transactions
        WHERE user_id = target_user_id
            AND transaction_category = category_record.category
            AND transaction_date >= analysis_start;
        
        -- Calculate growth rate (simple linear trend)
        SELECT 
            CASE 
                WHEN COUNT(*) > 1 THEN
                    ((MAX(amount) - MIN(amount)) / NULLIF(MIN(amount), 0) * 100)
                ELSE 0
            END
        INTO growth_rate_val
        FROM public.financial_transactions
        WHERE user_id = target_user_id
            AND transaction_category = category_record.category
            AND transaction_date >= analysis_start;
        
        -- Determine trend direction
        IF growth_rate_val > 5 THEN
            trend_dir := 'increasing';
        ELSIF growth_rate_val < -5 THEN
            trend_dir := 'decreasing';
        ELSIF std_dev / NULLIF(avg_amount, 0) > 0.3 THEN
            trend_dir := 'volatile';
        ELSE
            trend_dir := 'stable';
        END IF;
        
        -- Insert trend analysis
        INSERT INTO public.financial_trends (
            user_id,
            trend_type,
            category,
            analysis_start_date,
            analysis_end_date,
            trend_direction,
            growth_rate,
            average_value,
            volatility_score,
            description
        ) VALUES (
            target_user_id,
            category_record.category::TEXT || '_trend',
            category_record.category,
            analysis_start,
            analysis_end,
            trend_dir,
            growth_rate_val,
            avg_amount,
            (std_dev / NULLIF(avg_amount, 0) * 100),
            'Automated trend analysis for ' || category_record.category::TEXT
        );
    END LOOP;
END;
$$;

-- ============================================================
-- 5. RLS POLICIES
-- ============================================================

-- Financial Transactions RLS
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_manage_own_financial_transactions"
ON public.financial_transactions
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Budget Plans RLS
ALTER TABLE public.budget_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_manage_own_budget_plans"
ON public.budget_plans
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Cash Flow Forecasts RLS
ALTER TABLE public.cash_flow_forecasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_manage_own_cash_flow_forecasts"
ON public.cash_flow_forecasts
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Financial Trends RLS
ALTER TABLE public.financial_trends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_view_own_financial_trends"
ON public.financial_trends
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "users_insert_own_financial_trends"
ON public.financial_trends
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- ============================================================
-- 6. TRIGGERS
-- ============================================================

-- Auto-update updated_at timestamp
CREATE TRIGGER update_financial_transactions_updated_at
    BEFORE UPDATE ON public.financial_transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_budget_plans_updated_at
    BEFORE UPDATE ON public.budget_plans
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_cash_flow_forecasts_updated_at
    BEFORE UPDATE ON public.cash_flow_forecasts
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- 7. MOCK DATA
-- ============================================================

DO $$
DECLARE
    existing_user_id UUID;
    transaction_id UUID;
    budget_id UUID;
    month_counter INTEGER;
    current_month DATE;
BEGIN
    -- Get existing user from user_profiles (assuming auth already exists)
    SELECT id INTO existing_user_id FROM public.user_profiles LIMIT 1;
    
    IF existing_user_id IS NULL THEN
        RAISE NOTICE 'No existing users found. Run auth migration first or create users manually.';
        RETURN;
    END IF;
    
    -- Insert sample financial transactions (last 12 months)
    FOR month_counter IN 0..11 LOOP
        current_month := DATE_TRUNC('month', CURRENT_DATE) - (month_counter || ' months')::INTERVAL;
        
        -- Revenue transactions
        INSERT INTO public.financial_transactions (user_id, transaction_type, transaction_category, amount, transaction_date, description, account_number)
        VALUES 
            (existing_user_id, 'invoice', 'revenue', 15000 + (RANDOM() * 5000)::DECIMAL(10,2), current_month + INTERVAL '5 days', 'Ventes de marchandises - mois ' || TO_CHAR(current_month, 'MM/YYYY'), '707000'),
            (existing_user_id, 'invoice', 'revenue', 8000 + (RANDOM() * 2000)::DECIMAL(10,2), current_month + INTERVAL '15 days', 'Prestations de services - mois ' || TO_CHAR(current_month, 'MM/YYYY'), '706000');
        
        -- Expense transactions
        INSERT INTO public.financial_transactions (user_id, transaction_type, transaction_category, amount, transaction_date, description, account_number)
        VALUES 
            (existing_user_id, 'expense', 'cost_of_goods', 8000 + (RANDOM() * 2000)::DECIMAL(10,2), current_month + INTERVAL '10 days', 'Achats de marchandises', '607000'),
            (existing_user_id, 'expense', 'operating_expense', 5500, current_month + INTERVAL '1 days', 'Salaires et charges', '641000'),
            (existing_user_id, 'expense', 'operating_expense', 1800, current_month + INTERVAL '1 days', 'Loyer commercial', '613000'),
            (existing_user_id, 'expense', 'operating_expense', 500 + (RANDOM() * 300)::DECIMAL(10,2), current_month + INTERVAL '20 days', 'Charges diverses', '626000');
    END LOOP;
    
    -- Insert sample budget plans for current year
    INSERT INTO public.budget_plans (user_id, budget_name, budget_period, start_date, end_date, category, planned_amount, is_active)
    VALUES
        (existing_user_id, 'Budget Annuel 2025', 'annual', '2025-01-01', '2025-12-31', 'revenue', 300000, true),
        (existing_user_id, 'Budget Annuel 2025', 'annual', '2025-01-01', '2025-12-31', 'cost_of_goods', 120000, true),
        (existing_user_id, 'Budget Annuel 2025', 'annual', '2025-01-01', '2025-12-31', 'operating_expense', 100000, true),
        (existing_user_id, 'Budget Q1 2025', 'quarterly', '2025-01-01', '2025-03-31', 'revenue', 75000, true),
        (existing_user_id, 'Budget Q1 2025', 'quarterly', '2025-01-01', '2025-03-31', 'operating_expense', 25000, true);
    
    -- Generate initial cash flow forecasts
    PERFORM public.generate_cash_flow_forecast(existing_user_id, 6);
    
    -- Generate initial trend analysis
    PERFORM public.analyze_financial_trends(existing_user_id, 12);
    
    RAISE NOTICE 'Financial analytics mock data created successfully for user %', existing_user_id;
END $$;