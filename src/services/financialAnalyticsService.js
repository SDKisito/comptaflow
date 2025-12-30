import { supabase } from '../lib/supabase';

/**
 * Financial Analytics Service
 * Handles all data operations for financial analytics features:
 * - Transactions, Budgets, Cash Flow Forecasts, Trends
 * - Converts between snake_case (DB) and camelCase (React)
 */

export const financialAnalyticsService = {
  // ============================================================
  // FINANCIAL TRANSACTIONS
  // ============================================================
  
  async getTransactions(userId, filters = {}) {
    try {
      let query = supabase?.from('financial_transactions')?.select('*')?.eq('user_id', userId)?.order('transaction_date', { ascending: false });
      
      // Apply filters
      if (filters?.startDate) {
        query = query?.gte('transaction_date', filters?.startDate);
      }
      if (filters?.endDate) {
        query = query?.lte('transaction_date', filters?.endDate);
      }
      if (filters?.type) {
        query = query?.eq('transaction_type', filters?.type);
      }
      if (filters?.category) {
        query = query?.eq('transaction_category', filters?.category);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Convert to camelCase
      return data?.map(row => ({
        id: row?.id,
        userId: row?.user_id,
        transactionType: row?.transaction_type,
        transactionCategory: row?.transaction_category,
        amount: parseFloat(row?.amount),
        currency: row?.currency,
        transactionDate: row?.transaction_date,
        description: row?.description,
        accountNumber: row?.account_number,
        referenceNumber: row?.reference_number,
        metadata: row?.metadata,
        createdAt: row?.created_at,
        updatedAt: row?.updated_at
      })) || [];
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  },

  async getTransactionSummary(userId, startDate, endDate) {
    try {
      const { data, error } = await supabase?.from('financial_transactions')?.select('transaction_category, amount')?.eq('user_id', userId)?.gte('transaction_date', startDate)?.lte('transaction_date', endDate);
      
      if (error) throw error;
      
      // Calculate summary by category
      const summary = {
        revenue: 0,
        costOfGoods: 0,
        operatingExpense: 0,
        financial: 0,
        tax: 0,
        other: 0,
        totalRevenue: 0,
        totalExpenses: 0,
        netIncome: 0
      };
      
      data?.forEach(row => {
        const amount = parseFloat(row?.amount);
        switch (row?.transaction_category) {
          case 'revenue':
            summary.revenue += amount;
            summary.totalRevenue += amount;
            break;
          case 'cost_of_goods':
            summary.costOfGoods += amount;
            summary.totalExpenses += amount;
            break;
          case 'operating_expense':
            summary.operatingExpense += amount;
            summary.totalExpenses += amount;
            break;
          case 'financial':
            summary.financial += amount;
            summary.totalExpenses += amount;
            break;
          case 'tax':
            summary.tax += amount;
            summary.totalExpenses += amount;
            break;
          default:
            summary.other += amount;
            summary.totalExpenses += amount;
        }
      });
      
      summary.netIncome = summary?.totalRevenue - summary?.totalExpenses;
      
      return summary;
    } catch (error) {
      console.error('Error fetching transaction summary:', error);
      throw error;
    }
  },

  // ============================================================
  // BUDGET PLANS
  // ============================================================
  
  async getBudgetPlans(userId, filters = {}) {
    try {
      let query = supabase?.from('budget_plans')?.select('*')?.eq('user_id', userId)?.order('start_date', { ascending: false });
      
      if (filters?.isActive !== undefined) {
        query = query?.eq('is_active', filters?.isActive);
      }
      if (filters?.period) {
        query = query?.eq('budget_period', filters?.period);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Convert to camelCase
      return data?.map(row => ({
        id: row?.id,
        userId: row?.user_id,
        budgetName: row?.budget_name,
        budgetPeriod: row?.budget_period,
        startDate: row?.start_date,
        endDate: row?.end_date,
        category: row?.category,
        plannedAmount: parseFloat(row?.planned_amount),
        isActive: row?.is_active,
        notes: row?.notes,
        createdAt: row?.created_at,
        updatedAt: row?.updated_at
      })) || [];
    } catch (error) {
      console.error('Error fetching budget plans:', error);
      throw error;
    }
  },

  async getBudgetVariance(budgetPlanId, actualStartDate, actualEndDate) {
    try {
      const { data, error } = await supabase?.rpc('calculate_budget_variance', {
        budget_plan_uuid: budgetPlanId,
        actual_start_date: actualStartDate,
        actual_end_date: actualEndDate
      });
      
      if (error) throw error;
      
      // Convert to camelCase
      return data?.map(row => ({
        category: row?.category,
        plannedAmount: parseFloat(row?.planned_amount),
        actualAmount: parseFloat(row?.actual_amount),
        varianceAmount: parseFloat(row?.variance_amount),
        variancePercentage: parseFloat(row?.variance_percentage)
      })) || [];
    } catch (error) {
      console.error('Error calculating budget variance:', error);
      throw error;
    }
  },

  async createBudgetPlan(userId, budgetData) {
    try {
      const { data, error } = await supabase?.from('budget_plans')?.insert({
          user_id: userId,
          budget_name: budgetData?.budgetName,
          budget_period: budgetData?.budgetPeriod,
          start_date: budgetData?.startDate,
          end_date: budgetData?.endDate,
          category: budgetData?.category,
          planned_amount: budgetData?.plannedAmount,
          is_active: budgetData?.isActive ?? true,
          notes: budgetData?.notes
        })?.select()?.single();
      
      if (error) throw error;
      
      // Convert to camelCase
      return {
        id: data?.id,
        userId: data?.user_id,
        budgetName: data?.budget_name,
        budgetPeriod: data?.budget_period,
        startDate: data?.start_date,
        endDate: data?.end_date,
        category: data?.category,
        plannedAmount: parseFloat(data?.planned_amount),
        isActive: data?.is_active,
        notes: data?.notes,
        createdAt: data?.created_at
      };
    } catch (error) {
      console.error('Error creating budget plan:', error);
      throw error;
    }
  },

  // ============================================================
  // CASH FLOW FORECASTS
  // ============================================================
  
  async getCashFlowForecasts(userId, forecastPeriods = null) {
    try {
      let query = supabase?.from('cash_flow_forecasts')?.select('*')?.eq('user_id', userId)?.order('forecast_date', { ascending: true });
      
      if (forecastPeriods) {
        query = query?.in('forecast_period', forecastPeriods);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Convert to camelCase
      return data?.map(row => ({
        id: row?.id,
        userId: row?.user_id,
        forecastDate: row?.forecast_date,
        forecastPeriod: row?.forecast_period,
        projectedRevenue: parseFloat(row?.projected_revenue),
        projectedExpenses: parseFloat(row?.projected_expenses),
        projectedNetFlow: parseFloat(row?.projected_net_flow),
        openingBalance: parseFloat(row?.opening_balance),
        closingBalance: parseFloat(row?.closing_balance),
        confidenceLevel: row?.confidence_level,
        methodology: row?.methodology,
        actualRevenue: row?.actual_revenue ? parseFloat(row?.actual_revenue) : null,
        actualExpenses: row?.actual_expenses ? parseFloat(row?.actual_expenses) : null,
        actualNetFlow: row?.actual_net_flow ? parseFloat(row?.actual_net_flow) : null,
        variancePercentage: row?.variance_percentage ? parseFloat(row?.variance_percentage) : null,
        notes: row?.notes,
        createdAt: row?.created_at,
        updatedAt: row?.updated_at
      })) || [];
    } catch (error) {
      console.error('Error fetching cash flow forecasts:', error);
      throw error;
    }
  },

  async generateForecasts(userId, months = 6) {
    try {
      const { error } = await supabase?.rpc('generate_cash_flow_forecast', {
        target_user_id: userId,
        forecast_months: months
      });
      
      if (error) throw error;
      
      // Fetch the newly generated forecasts
      return await this.getCashFlowForecasts(userId);
    } catch (error) {
      console.error('Error generating cash flow forecasts:', error);
      throw error;
    }
  },

  async updateForecastActuals(forecastId, actualsData) {
    try {
      const { data, error } = await supabase?.from('cash_flow_forecasts')?.update({
          actual_revenue: actualsData?.actualRevenue,
          actual_expenses: actualsData?.actualExpenses,
          actual_net_flow: actualsData?.actualNetFlow,
          variance_percentage: actualsData?.variancePercentage
        })?.eq('id', forecastId)?.select()?.single();
      
      if (error) throw error;
      
      return {
        id: data?.id,
        actualRevenue: parseFloat(data?.actual_revenue),
        actualExpenses: parseFloat(data?.actual_expenses),
        actualNetFlow: parseFloat(data?.actual_net_flow),
        variancePercentage: parseFloat(data?.variance_percentage)
      };
    } catch (error) {
      console.error('Error updating forecast actuals:', error);
      throw error;
    }
  },

  // ============================================================
  // FINANCIAL TRENDS
  // ============================================================
  
  async getFinancialTrends(userId, filters = {}) {
    try {
      let query = supabase?.from('financial_trends')?.select('*')?.eq('user_id', userId)?.order('calculated_at', { ascending: false });
      
      if (filters?.trendType) {
        query = query?.eq('trend_type', filters?.trendType);
      }
      if (filters?.category) {
        query = query?.eq('category', filters?.category);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Convert to camelCase
      return data?.map(row => ({
        id: row?.id,
        userId: row?.user_id,
        trendType: row?.trend_type,
        category: row?.category,
        analysisStartDate: row?.analysis_start_date,
        analysisEndDate: row?.analysis_end_date,
        trendDirection: row?.trend_direction,
        growthRate: row?.growth_rate ? parseFloat(row?.growth_rate) : null,
        averageValue: row?.average_value ? parseFloat(row?.average_value) : null,
        volatilityScore: row?.volatility_score ? parseFloat(row?.volatility_score) : null,
        description: row?.description,
        recommendations: row?.recommendations,
        calculatedAt: row?.calculated_at,
        createdAt: row?.created_at
      })) || [];
    } catch (error) {
      console.error('Error fetching financial trends:', error);
      throw error;
    }
  },

  async analyzeTrends(userId, lookbackMonths = 12) {
    try {
      const { error } = await supabase?.rpc('analyze_financial_trends', {
        target_user_id: userId,
        lookback_months: lookbackMonths
      });
      
      if (error) throw error;
      
      // Fetch the newly generated trends
      return await this.getFinancialTrends(userId);
    } catch (error) {
      console.error('Error analyzing financial trends:', error);
      throw error;
    }
  },

  // ============================================================
  // DASHBOARD KPIs
  // ============================================================
  
  async getDashboardKPIs(userId, currentPeriodStart, currentPeriodEnd, comparisonPeriodStart, comparisonPeriodEnd) {
    try {
      // Get current period summary
      const currentSummary = await this.getTransactionSummary(userId, currentPeriodStart, currentPeriodEnd);
      
      // Get comparison period summary if dates provided
      let comparisonSummary = null;
      if (comparisonPeriodStart && comparisonPeriodEnd) {
        comparisonSummary = await this.getTransactionSummary(userId, comparisonPeriodStart, comparisonPeriodEnd);
      }
      
      // Calculate KPIs with changes
      const calculateChange = (current, comparison) => {
        if (!comparison || comparison === 0) return null;
        const change = ((current - comparison) / comparison) * 100;
        return {
          value: change,
          formatted: (change > 0 ? '+' : '') + change?.toFixed(1) + '%'
        };
      };
      
      const kpis = [
        {
          id: 'revenue',
          label: 'Chiffre d\'affaires',
          value: currentSummary?.totalRevenue,
          formattedValue: new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })?.format(currentSummary?.totalRevenue),
          change: calculateChange(currentSummary?.totalRevenue, comparisonSummary?.totalRevenue),
          trend: currentSummary?.totalRevenue >= (comparisonSummary?.totalRevenue || 0) ? 'up' : 'down',
          isPositive: true
        },
        {
          id: 'net_income',
          label: 'Résultat net',
          value: currentSummary?.netIncome,
          formattedValue: new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })?.format(currentSummary?.netIncome),
          change: calculateChange(currentSummary?.netIncome, comparisonSummary?.netIncome),
          trend: currentSummary?.netIncome >= (comparisonSummary?.netIncome || 0) ? 'up' : 'down',
          isPositive: true
        },
        {
          id: 'margin',
          label: 'Marge brute',
          value: currentSummary?.totalRevenue > 0 
            ? ((currentSummary?.totalRevenue - currentSummary?.costOfGoods) / currentSummary?.totalRevenue) * 100
            : 0,
          formattedValue: currentSummary?.totalRevenue > 0
            ? (((currentSummary?.totalRevenue - currentSummary?.costOfGoods) / currentSummary?.totalRevenue) * 100)?.toFixed(1) + '%' :'0%',
          change: null, // Can be calculated if needed
          trend: 'stable',
          isPositive: true
        },
        {
          id: 'expenses',
          label: 'Charges totales',
          value: currentSummary?.totalExpenses,
          formattedValue: new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })?.format(currentSummary?.totalExpenses),
          change: calculateChange(currentSummary?.totalExpenses, comparisonSummary?.totalExpenses),
          trend: currentSummary?.totalExpenses >= (comparisonSummary?.totalExpenses || 0) ? 'up' : 'down',
          isPositive: false
        }
      ];
      
      return kpis;
    } catch (error) {
      console.error('Error fetching dashboard KPIs:', error);
      throw error;
    }
  }
};