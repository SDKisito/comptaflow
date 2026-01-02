import { supabase } from '../lib/supabase';

export const financialAnalyticsService = {
  // Get dashboard KPIs
  async getDashboardKPIs(userId, startDate, endDate, comparisonStart = null, comparisonEnd = null) {
    try {
      // Get current period transactions
      const { data: currentTransactions, error } = await supabase
        .from('financial_transactions')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate)
        .lte('date', endDate);

      if (error) throw error;

      // Calculate KPIs
      const revenue = currentTransactions
        ?.filter(t => t.type === 'income')
        ?.reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0;

      const expenses = currentTransactions
        ?.filter(t => t.type === 'expense')
        ?.reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0;

      const netProfit = revenue - expenses;
      const profitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

      // Get comparison data if requested
      let comparison = null;
      if (comparisonStart && comparisonEnd) {
        const { data: comparisonTransactions } = await supabase
          .from('financial_transactions')
          .select('*')
          .eq('user_id', userId)
          .gte('date', comparisonStart)
          .lte('date', comparisonEnd);

        const compRevenue = comparisonTransactions
          ?.filter(t => t.type === 'income')
          ?.reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0;

        const compExpenses = comparisonTransactions
          ?.filter(t => t.type === 'expense')
          ?.reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0;

        comparison = {
          revenue: compRevenue,
          expenses: compExpenses,
          netProfit: compRevenue - compExpenses
        };
      }

      return [
        {
          id: 'revenue',
          label: 'Chiffre d\'affaires',
          value: revenue,
          comparison: comparison?.revenue,
          trend: comparison ? ((revenue - comparison.revenue) / comparison.revenue * 100) : 0,
          icon: 'TrendingUp'
        },
        {
          id: 'expenses',
          label: 'Dépenses',
          value: expenses,
          comparison: comparison?.expenses,
          trend: comparison ? ((expenses - comparison.expenses) / comparison.expenses * 100) : 0,
          icon: 'TrendingDown'
        },
        {
          id: 'netProfit',
          label: 'Bénéfice net',
          value: netProfit,
          comparison: comparison?.netProfit,
          trend: comparison ? ((netProfit - comparison.netProfit) / Math.abs(comparison.netProfit) * 100) : 0,
          icon: 'DollarSign'
        },
        {
          id: 'profitMargin',
          label: 'Marge bénéficiaire',
          value: profitMargin,
          comparison: comparison ? (comparison.revenue > 0 ? (comparison.netProfit / comparison.revenue * 100) : 0) : null,
          trend: 0,
          icon: 'Percent',
          isPercentage: true
        }
      ];
    } catch (error) {
      console.error('Error getting dashboard KPIs:', error);
      throw error;
    }
  },

  // Get transactions
  async getTransactions(userId, filters = {}) {
    try {
      let query = supabase
        .from('financial_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (filters.startDate) {
        query = query.gte('date', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('date', filters.endDate);
      }
      if (filters.type) {
        query = query.eq('type', filters.type);
      }
      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error getting transactions:', error);
      throw error;
    }
  },

  // Get budget plans (placeholder - table doesn't exist yet)
  async getBudgetPlans(userId, filters = {}) {
    // Return empty for now
    return [];
  },

  // Get cash flow forecasts (placeholder - table doesn't exist yet)
  async getCashFlowForecasts(userId) {
    // Return empty for now
    return [];
  },

  // Get financial trends (placeholder - table doesn't exist yet)
  async getFinancialTrends(userId) {
    // Return empty for now
    return [];
  },

  // Get budget variance (placeholder)
  async getBudgetVariance(budgetId, startDate, endDate) {
    // Return empty for now
    return [];
  },

  // Generate forecasts (placeholder)
  async generateForecasts(userId, months) {
    console.log('Generate forecasts not implemented yet');
    return [];
  },

  // Analyze trends (placeholder)
  async analyzeTrends(userId, months) {
    console.log('Analyze trends not implemented yet');
    return [];
  },

  // Export to PDF
  async exportToPDF(reportType, data, period) {
    // This would use jsPDF
    console.log('Export to PDF:', reportType);
    alert('Export PDF - À implémenter');
  },

  // Export to Excel
  async exportToExcel(reportType, data, period) {
    // This would use xlsx library
    console.log('Export to Excel:', reportType);
    alert('Export Excel - À implémenter');
  },

  // Export to CSV
  async exportToCSV(reportType, data, period) {
    try {
      if (!data || data.length === 0) {
        alert('Aucune donnée à exporter');
        return;
      }

      // Convert data to CSV
      const headers = Object.keys(data[0]).join(',');
      const rows = data.map(row => 
        Object.values(row).map(val => 
          typeof val === 'string' && val.includes(',') ? `"${val}"` : val
        ).join(',')
      );
      const csv = [headers, ...rows].join('\n');

      // Download CSV
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${reportType}_${period}_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Erreur lors de l\'export CSV: ' + error.message);
    }
  }
};
