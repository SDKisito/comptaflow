import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import NavigationSidebar from '../../components/ui/NavigationSidebar';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import ReportTypeCard from './components/ReportTypeCard';
import DateRangeSelector from './components/DateRangeSelector';
import ComparisonToggle from './components/ComparisonToggle';
import KPICard from './components/KPICard';
import ProfitLossTable from './components/ProfitLossTable';

import CashFlowChart from './components/CashFlowChart';
import ExportOptions from './components/ExportOptions';
import FilterPanel from './components/FilterPanel';
import { financialAnalyticsService } from '../../services/financialAnalyticsService';
import { useAuth } from '../../contexts/AuthContext';

const FinancialReports = () => {
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedReport, setSelectedReport] = useState('profit_loss');
  const [selectedPeriod, setSelectedPeriod] = useState('current_month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [comparisonEnabled, setComparisonEnabled] = useState(false);
  const [comparisonPeriod, setComparisonPeriod] = useState('previous_period');
  const [showFilters, setShowFilters] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Data states (initialized empty, loaded from Supabase)
  const [kpiData, setKpiData] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [budgetPlans, setBudgetPlans] = useState([]);
  const [cashFlowForecasts, setCashFlowForecasts] = useState([]);
  const [financialTrends, setFinancialTrends] = useState([]);
  const [budgetVariance, setBudgetVariance] = useState([]);
  
  const [filters, setFilters] = useState({
    accountCategory: 'all',
    businessUnit: 'all',
    showZeroAccounts: false,
    groupByCategory: true,
    showSubtotals: true
  });

  const reportTypes = [
    {
      id: 'profit_loss',
      name: 'Compte de Résultat',
      description: 'Analyse des produits et charges',
      icon: 'TrendingUp'
    },
    {
      id: 'balance_sheet',
      name: 'Bilan',
      description: 'Situation patrimoniale de l\'entreprise',
      icon: 'Scale'
    },
    {
      id: 'cash_flow',
      name: 'Tableau de Flux',
      description: 'Flux de trésorerie par activité',
      icon: 'Wallet'
    },
    {
      id: 'forecast',
      name: 'Prévisions',
      description: 'Projections de trésorerie',
      icon: 'TrendingUp'
    },
    {
      id: 'budget_variance',
      name: 'Écarts Budgétaires',
      description: 'Analyse budget vs réalisé',
      icon: 'BarChart'
    },
    {
      id: 'trends',
      name: 'Tendances',
      description: 'Analyse des tendances historiques',
      icon: 'Activity'
    }
  ];

  // Calculate date ranges based on selected period
  const getDateRanges = () => {
    const today = new Date();
    let currentStart, currentEnd, comparisonStart, comparisonEnd;
    
    switch (selectedPeriod) {
      case 'current_month':
        currentStart = new Date(today.getFullYear(), today.getMonth(), 1);
        currentEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        comparisonStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        comparisonEnd = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      case 'current_quarter':
        const currentQuarter = Math.floor(today?.getMonth() / 3);
        currentStart = new Date(today.getFullYear(), currentQuarter * 3, 1);
        currentEnd = new Date(today.getFullYear(), (currentQuarter + 1) * 3, 0);
        comparisonStart = new Date(today.getFullYear(), (currentQuarter - 1) * 3, 1);
        comparisonEnd = new Date(today.getFullYear(), currentQuarter * 3, 0);
        break;
      case 'current_year':
        currentStart = new Date(today.getFullYear(), 0, 1);
        currentEnd = new Date(today.getFullYear(), 11, 31);
        comparisonStart = new Date(today.getFullYear() - 1, 0, 1);
        comparisonEnd = new Date(today.getFullYear() - 1, 11, 31);
        break;
      case 'custom':
        currentStart = customStartDate ? new Date(customStartDate) : currentStart;
        currentEnd = customEndDate ? new Date(customEndDate) : currentEnd;
        // For custom, comparison is same length period before
        if (currentStart && currentEnd) {
          const daysDiff = (currentEnd - currentStart) / (1000 * 60 * 60 * 24);
          comparisonEnd = new Date(currentStart);
          comparisonEnd?.setDate(comparisonEnd?.getDate() - 1);
          comparisonStart = new Date(comparisonEnd);
          comparisonStart?.setDate(comparisonStart?.getDate() - daysDiff);
        }
        break;
      default:
        currentStart = new Date(today.getFullYear(), today.getMonth(), 1);
        currentEnd = today;
    }
    
    return {
      currentStart: currentStart?.toISOString()?.split('T')?.[0],
      currentEnd: currentEnd?.toISOString()?.split('T')?.[0],
      comparisonStart: comparisonStart?.toISOString()?.split('T')?.[0],
      comparisonEnd: comparisonEnd?.toISOString()?.split('T')?.[0]
    };
  };

  // Load all financial data from Supabase
  const loadFinancialData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError('');
    
    try {
      const dateRanges = getDateRanges();
      
      // Load KPIs
      const kpis = await financialAnalyticsService?.getDashboardKPIs(
        user?.id,
        dateRanges?.currentStart,
        dateRanges?.currentEnd,
        comparisonEnabled ? dateRanges?.comparisonStart : null,
        comparisonEnabled ? dateRanges?.comparisonEnd : null
      );
      setKpiData(kpis);
      
      // Load transactions
      const txns = await financialAnalyticsService?.getTransactions(user?.id, {
        startDate: dateRanges?.currentStart,
        endDate: dateRanges?.currentEnd
      });
      setTransactions(txns);
      
      // Load budget plans
      const budgets = await financialAnalyticsService?.getBudgetPlans(user?.id, {
        isActive: true
      });
      setBudgetPlans(budgets);
      
      // Load cash flow forecasts
      const forecasts = await financialAnalyticsService?.getCashFlowForecasts(user?.id);
      setCashFlowForecasts(forecasts);
      
      // Load financial trends
      const trends = await financialAnalyticsService?.getFinancialTrends(user?.id);
      setFinancialTrends(trends);
      
      // Calculate budget variance if we have active budgets
      if (budgets?.length > 0) {
        const variance = await financialAnalyticsService?.getBudgetVariance(
          budgets?.[0]?.id,
          dateRanges?.currentStart,
          dateRanges?.currentEnd
        );
        setBudgetVariance(variance);
      }
      
    } catch (err) {
      console.error('Error loading financial data:', err);
      setError(err?.message || 'Erreur lors du chargement des données financières');
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount and when period changes
  useEffect(() => {
    loadFinancialData();
  }, [user?.id, selectedPeriod, customStartDate, customEndDate, comparisonEnabled]);

  const handleCustomDateChange = (type, value) => {
    if (type === 'start') {
      setCustomStartDate(value);
    } else {
      setCustomEndDate(value);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    setShowFilters(false);
    loadFinancialData();
  };

  const handleResetFilters = () => {
    setFilters({
      accountCategory: 'all',
      businessUnit: 'all',
      showZeroAccounts: false,
      groupByCategory: true,
      showSubtotals: true
    });
  };

  const handleExport = (format) => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      alert(`Rapport exporté au format ${format?.toUpperCase()}`);
    }, 1500);
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      await loadFinancialData();
      
      // Also generate fresh forecasts and trends
      if (user?.id) {
        await financialAnalyticsService?.generateForecasts(user?.id, 6);
        await financialAnalyticsService?.analyzeTrends(user?.id, 12);
      }
    } catch (err) {
      setError(err?.message || 'Erreur lors de la génération du rapport');
    } finally {
      setIsGenerating(false);
    }
  };

  const renderReportContent = () => {
    // Show loading state
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-12 md:py-16">
          <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-sm md:text-base text-muted-foreground">Chargement des données...</p>
        </div>
      );
    }

    // Show error state
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-12 md:py-16">
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-error/10 flex items-center justify-center mb-4">
            <Icon name="AlertCircle" size={32} color="var(--color-error)" />
          </div>
          <p className="text-sm md:text-base text-error mb-2">Erreur</p>
          <p className="text-xs md:text-sm text-muted-foreground">{error}</p>
          <Button variant="outline" onClick={loadFinancialData} className="mt-4">
            Réessayer
          </Button>
        </div>
      );
    }

    // Render based on selected report type
    switch (selectedReport) {
      case 'profit_loss':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {kpiData?.map(kpi => (
                <KPICard key={kpi?.id} kpi={kpi} />
              ))}
            </div>
            <div className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-elevation-1">
              <h3 className="font-heading font-semibold text-lg md:text-xl mb-4">
                Compte de Résultat Détaillé
              </h3>
              {transactions?.length > 0 ? (
                <ProfitLossTable 
                  data={transactions} 
                  showComparison={comparisonEnabled}
                  comparisonData={[]}
                />
              ) : (
                <p className="text-muted-foreground text-center py-8">Aucune transaction disponible</p>
              )}
            </div>
          </div>
        );
      
      case 'cash_flow':
        return (
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-elevation-1">
              <h3 className="font-heading font-semibold text-lg md:text-xl mb-4">
                Évolution des Flux de Trésorerie
              </h3>
              {cashFlowForecasts?.length > 0 ? (
                <CashFlowChart data={cashFlowForecasts} />
              ) : (
                <p className="text-muted-foreground text-center py-8">Aucune donnée de flux de trésorerie disponible</p>
              )}
            </div>
          </div>
        );

      case 'forecast':
        return (
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-elevation-1">
              <h3 className="font-heading font-semibold text-lg md:text-xl mb-6">
                Prévisions de Trésorerie
              </h3>
              {cashFlowForecasts?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted border-b-2 border-border">
                      <tr>
                        <th className="py-3 px-4 text-left text-sm font-semibold">Période</th>
                        <th className="py-3 px-4 text-right text-sm font-semibold">Revenus prévus</th>
                        <th className="py-3 px-4 text-right text-sm font-semibold">Dépenses prévues</th>
                        <th className="py-3 px-4 text-right text-sm font-semibold">Flux net</th>
                        <th className="py-3 px-4 text-right text-sm font-semibold">Solde final</th>
                        <th className="py-3 px-4 text-center text-sm font-semibold">Confiance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cashFlowForecasts?.map((forecast, index) => (
                        <tr key={forecast?.id} className={`${index % 2 === 0 ? 'bg-card' : 'bg-muted/30'} hover:bg-muted/50 transition-smooth border-b border-border`}>
                          <td className="py-3 px-4 text-sm">{forecast?.forecastPeriod}</td>
                          <td className="py-3 px-4 text-right text-sm data-text text-success">
                            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })?.format(forecast?.projectedRevenue)}
                          </td>
                          <td className="py-3 px-4 text-right text-sm data-text text-error">
                            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })?.format(forecast?.projectedExpenses)}
                          </td>
                          <td className={`py-3 px-4 text-right text-sm font-medium data-text ${forecast?.projectedNetFlow >= 0 ? 'text-success' : 'text-error'}`}>
                            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })?.format(forecast?.projectedNetFlow)}
                          </td>
                          <td className="py-3 px-4 text-right text-sm font-bold data-text">
                            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })?.format(forecast?.closingBalance)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              forecast?.confidenceLevel === 'high' ? 'bg-success/10 text-success' :
                              forecast?.confidenceLevel === 'medium'? 'bg-warning/10 text-warning' : 'bg-error/10 text-error'
                            }`}>
                              {forecast?.confidenceLevel === 'high' ? 'Élevée' : forecast?.confidenceLevel === 'medium' ? 'Moyenne' : 'Faible'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">Aucune prévision disponible</p>
              )}
            </div>
          </div>
        );

      case 'budget_variance':
        return (
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-elevation-1">
              <h3 className="font-heading font-semibold text-lg md:text-xl mb-6">
                Analyse des Écarts Budgétaires
              </h3>
              {budgetVariance?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted border-b-2 border-border">
                      <tr>
                        <th className="py-3 px-4 text-left text-sm font-semibold">Catégorie</th>
                        <th className="py-3 px-4 text-right text-sm font-semibold">Budget</th>
                        <th className="py-3 px-4 text-right text-sm font-semibold">Réalisé</th>
                        <th className="py-3 px-4 text-right text-sm font-semibold">Écart</th>
                        <th className="py-3 px-4 text-right text-sm font-semibold">% Écart</th>
                      </tr>
                    </thead>
                    <tbody>
                      {budgetVariance?.map((item, index) => (
                        <tr key={item?.category} className={`${index % 2 === 0 ? 'bg-card' : 'bg-muted/30'} hover:bg-muted/50 transition-smooth border-b border-border`}>
                          <td className="py-3 px-4 text-sm font-medium">{item?.category}</td>
                          <td className="py-3 px-4 text-right text-sm data-text">
                            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })?.format(item?.plannedAmount)}
                          </td>
                          <td className="py-3 px-4 text-right text-sm data-text">
                            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })?.format(item?.actualAmount)}
                          </td>
                          <td className={`py-3 px-4 text-right text-sm font-medium data-text ${item?.varianceAmount >= 0 ? 'text-success' : 'text-error'}`}>
                            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })?.format(Math.abs(item?.varianceAmount))}
                          </td>
                          <td className={`py-3 px-4 text-right text-sm font-bold ${Math.abs(item?.variancePercentage) > 10 ? 'text-error' : 'text-success'}`}>
                            {item?.variancePercentage?.toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">Aucun écart budgétaire disponible</p>
              )}
            </div>
          </div>
        );

      case 'trends':
        return (
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-elevation-1">
              <h3 className="font-heading font-semibold text-lg md:text-xl mb-6">
                Analyse des Tendances Financières
              </h3>
              {financialTrends?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {financialTrends?.map((trend) => (
                    <div key={trend?.id} className="border border-border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-heading font-semibold text-base mb-1">{trend?.category}</h4>
                          <p className="text-xs text-muted-foreground">
                            {new Date(trend?.analysisStartDate)?.toLocaleDateString('fr-FR')} - {new Date(trend?.analysisEndDate)?.toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          trend?.trendDirection === 'increasing' ? 'bg-success/10 text-success' :
                          trend?.trendDirection === 'decreasing' ? 'bg-error/10 text-error' :
                          trend?.trendDirection === 'volatile' ? 'bg-warning/10 text-warning' : 'bg-muted text-foreground'
                        }`}>
                          {trend?.trendDirection === 'increasing' ? 'Croissant' :
                           trend?.trendDirection === 'decreasing' ? 'Décroissant' :
                           trend?.trendDirection === 'volatile' ? 'Volatile' : 'Stable'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Taux de croissance</p>
                          <p className={`text-lg font-bold ${trend?.growthRate >= 0 ? 'text-success' : 'text-error'}`}>
                            {trend?.growthRate?.toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Volatilité</p>
                          <p className="text-lg font-bold text-foreground">
                            {trend?.volatilityScore?.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{trend?.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">Aucune tendance disponible</p>
              )}
            </div>
          </div>
        );
      
      default:
        return (
          <div className="flex flex-col items-center justify-center py-12 md:py-16">
            <p className="text-sm md:text-base text-muted-foreground">Sélectionnez un type de rapport</p>
          </div>
        );
    }
  };

  return (
    <>
      <Helmet>
        <title>Rapports Financiers - ComptaFlow</title>
        <meta name="description" content="Générez et analysez vos rapports financiers avec prévisions de trésorerie et analyse des tendances" />
      </Helmet>
      <div className="flex min-h-screen bg-background">
        <NavigationSidebar 
          isCollapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
        />

        <main className={`
          flex-1 transition-smooth
          ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-60'}
          p-4 md:p-6 lg:p-8
        `}>
          <BreadcrumbTrail />

          <div className="mb-6 md:mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold text-foreground mb-2">
                  Rapports Financiers
                </h1>
                <p className="text-sm md:text-base text-muted-foreground">
                  Générez et analysez vos états financiers pour une vision complète de votre activité
                </p>
              </div>
              <Button
                variant="default"
                iconName="RefreshCw"
                iconPosition="left"
                onClick={handleGenerateReport}
                loading={isGenerating}
              >
                Générer le rapport
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-elevation-1">
                <h2 className="font-heading font-semibold text-base md:text-lg mb-4">Type de rapport</h2>
                <div className="space-y-3">
                  {reportTypes?.map(report => (
                    <ReportTypeCard
                      key={report?.id}
                      report={report}
                      isSelected={selectedReport === report?.id}
                      onClick={() => setSelectedReport(report?.id)}
                    />
                  ))}
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-elevation-1">
                <h2 className="font-heading font-semibold text-base md:text-lg mb-4">Paramètres</h2>
                <div className="space-y-4">
                  <DateRangeSelector
                    selectedPeriod={selectedPeriod}
                    onPeriodChange={setSelectedPeriod}
                    customStartDate={customStartDate}
                    customEndDate={customEndDate}
                    onCustomDateChange={handleCustomDateChange}
                  />
                  <ComparisonToggle
                    isEnabled={comparisonEnabled}
                    onToggle={setComparisonEnabled}
                    comparisonPeriod={comparisonPeriod}
                    onComparisonPeriodChange={setComparisonPeriod}
                  />
                </div>
              </div>

              <Button
                variant="outline"
                iconName="Filter"
                iconPosition="left"
                onClick={() => setShowFilters(!showFilters)}
                fullWidth
              >
                {showFilters ? 'Masquer les filtres' : 'Filtres avancés'}
              </Button>

              {showFilters && (
                <FilterPanel
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onApply={handleApplyFilters}
                  onReset={handleResetFilters}
                />
              )}
            </div>

            <div className="lg:col-span-3 space-y-6">
              <div className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-elevation-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                  <div>
                    <h2 className="font-heading font-semibold text-lg md:text-xl text-foreground">
                      {reportTypes?.find(r => r?.id === selectedReport)?.name}
                    </h2>
                    <p className="text-xs md:text-sm text-muted-foreground mt-1">
                      Période: {selectedPeriod === 'current_month' ? 'Mois en cours' : 'Personnalisée'}
                    </p>
                  </div>
                  <ExportOptions onExport={handleExport} isGenerating={isGenerating} />
                </div>

                {isGenerating ? (
                  <div className="flex flex-col items-center justify-center py-12 md:py-16">
                    <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-sm md:text-base text-muted-foreground">Génération du rapport en cours...</p>
                  </div>
                ) : (
                  renderReportContent()
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default FinancialReports;