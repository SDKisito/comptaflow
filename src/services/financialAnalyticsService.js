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
      let query = supabase
        ?.from('financial_transactions')
        ?.select('*')
        ?.eq('user_id', userId)
        ?.order('created_at', { ascending: false });

      // Apply filters
      if (filters?.startDate) {
        query = query?.gte('created_at', filters?.startDate);
      }
      if (filters?.endDate) {
        query = query?.lte('created_at', filters?.endDate);
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
      return (
        data?.map(row => ({
          id: row?.id,
          userId: row?.user_id,
          transactionType: row?.transaction_type,
          transactionCategory: row?.transaction_category,
          amount: parseFloat(row?.amount),
          currency: row?.currency,
          transactionDate: row?.created_at,
          description: row?.description,
          accountNumber: row?.account_number,
          referenceNumber: row?.reference_number,
          metadata: row?.metadata,
          createdAt: row?.created_at,
          updatedAt: row?.updated_at
        })) || []
      );
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  },

  async getTransactionSummary(userId, startDate, endDate) {
    try {
      const { data, error } = await supabase
        ?.from('financial_transactions')
        ?.select('transaction_category, amount')
        ?.eq('user_id', userId)
        ?.gte('created_at', startDate)
        ?.lte('created_at', endDate);

      if (error) throw error;

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

      summary.netIncome = summary.totalRevenue - summary.totalExpenses;
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
      let query = supabase
        ?.from('budget_plans')
        ?.select('*')
        ?.eq('user_id', userId)
        ?.order('start_date', { ascending: false });

      if (filters?.isActive !== undefined) {
        query = query?.eq('is_active', filters?.isActive);
      }
      if (filters?.period) {
        query = query?.eq('budget_period', filters?.period);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (
        data?.map(row => ({
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
        })) || []
      );
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

      return (
        data?.map(row => ({
          category: row?.category,
          plannedAmount: parseFloat(row?.planned_amount),
          actualAmount: parseFloat(row?.actual_amount),
          varianceAmount: parseFloat(row?.variance_amount),
          variancePercentage: parseFloat(row?.variance_percentage)
        })) || []
      );
    } catch (error) {
      console.error('Error calculating budget variance:', error);
      throw error;
    }
  },

  async createBudgetPlan(userId, budgetData) {
    try {
      const { data, error } = await supabase
        ?.from('budget_plans')
        ?.insert({
          user_id: userId,
          budget_name: budgetData?.budgetName,
          budget_period: budgetData?.budgetPeriod,
          start_date: budgetData?.startDate,
          end_date: budgetData?.endDate,
          category: budgetData?.category,
          planned_amount: budgetData?.plannedAmount,
          is_active: budgetData?.isActive ?? true,
          notes: budgetData?.notes
        })
        ?.select()
        ?.single();

      if (error) throw error;

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
  // DASHBOARD KPIs
  // ============================================================

  async getDashboardKPIs(
    userId,
    currentPeriodStart,
    currentPeriodEnd,
    comparisonPeriodStart,
    comparisonPeriodEnd
  ) {
    try {
      const currentSummary = await this.getTransactionSummary(
        userId,
        currentPeriodStart,
        currentPeriodEnd
      );

      let comparisonSummary = null;
      if (comparisonPeriodStart && comparisonPeriodEnd) {
        comparisonSummary = await this.getTransactionSummary(
          userId,
          comparisonPeriodStart,
          comparisonPeriodEnd
        );
      }

      const calculateChange = (current, comparison) => {
        if (!comparison || comparison === 0) return null;
        const change = ((current - comparison) / comparison) * 100;
        return {
          value: change,
          formatted: (change > 0 ? '+' : '') + change.toFixed(1) + '%'
        };
      };

      return [
        {
          id: 'revenue',
          label: 'Chiffre d\'affaires',
          value: currentSummary.totalRevenue,
          formattedValue: new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR'
          }).format(currentSummary.totalRevenue),
          change: calculateChange(
            currentSummary.totalRevenue,
            comparisonSummary?.totalRevenue
          ),
          trend:
            currentSummary.totalRevenue >=
            (comparisonSummary?.totalRevenue || 0)
              ? 'up'
              : 'down',
          isPositive: true
        }
      ];
    } catch (error) {
      console.error('Error fetching dashboard KPIs:', error);
      throw error;
    }
  }
};
