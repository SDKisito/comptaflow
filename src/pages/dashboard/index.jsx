import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import NavigationSidebar from '../../components/ui/NavigationSidebar';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import MetricCard from './components/MetricCard';
import RecentTransactionsTable from './components/RecentTransactionsTable';
import TaxDeadlinesPanel from './components/TaxDeadlinesPanel';
import QuickActionButtons from './components/QuickActionButtons';
import RevenueChart from './components/RevenueChart';
import ExpenseCategoryChart from './components/ExpenseCategoryChart';
import NotificationCenter from './components/NotificationCenter';
import { trackEngagement } from '../../utils/analytics';

const Dashboard = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const metrics = [
    {
      title: "Revenus du Mois",
      value: "45 280 €",
      change: "+12,5%",
      changeType: "positive",
      icon: "TrendingUp",
      iconColor: "var(--color-success)",
      trend: "vs mois dernier"
    },
    {
      title: "Factures en Attente",
      value: "18 450 €",
      change: "8 factures",
      changeType: "neutral",
      icon: "FileText",
      iconColor: "var(--color-warning)",
      trend: "à encaisser"
    },
    {
      title: "Dépenses en Attente",
      value: "12 340 €",
      change: "-8,3%",
      changeType: "positive",
      icon: "Receipt",
      iconColor: "var(--color-error)",
      trend: "vs mois dernier"
    },
    {
      title: "Flux de Trésorerie",
      value: "32 940 €",
      change: "+15,2%",
      changeType: "positive",
      icon: "Wallet",
      iconColor: "var(--color-primary)",
      trend: "solde actuel"
    }
  ];

  const recentTransactions = [
    {
      id: 1,
      type: "invoice",
      description: "Facture #INV-2024-1247",
      client: "SARL Dupont & Associés",
      date: "23/12/2024",
      amount: 4850.00,
      status: "paid"
    },
    {
      id: 2,
      type: "expense",
      description: "Fournitures de bureau",
      client: "Office Depot France",
      date: "22/12/2024",
      amount: -285.50,
      status: "paid"
    },
    {
      id: 3,
      type: "invoice",
      description: "Facture #INV-2024-1246",
      client: "Entreprise Martin SAS",
      date: "21/12/2024",
      amount: 6200.00,
      status: "pending"
    },
    {
      id: 4,
      type: "payment",
      description: "Paiement reçu - INV-2024-1240",
      client: "Société Lefebvre",
      date: "20/12/2024",
      amount: 3450.00,
      status: "paid"
    },
    {
      id: 5,
      type: "expense",
      description: "Abonnement logiciel comptable",
      client: "Sage France",
      date: "19/12/2024",
      amount: -149.99,
      status: "paid"
    },
    {
      id: 6,
      type: "invoice",
      description: "Facture #INV-2024-1245",
      client: "Cabinet Bernard",
      date: "18/12/2024",
      amount: 5800.00,
      status: "overdue"
    }
  ];

  const taxDeadlines = [
    {
      id: 1,
      title: "Déclaration TVA - Décembre 2024",
      description: "Déclaration mensuelle de la taxe sur la valeur ajoutée pour la période de décembre 2024",
      date: "15/01/2025",
      daysRemaining: 22,
      icon: "FileCheck"
    },
    {
      id: 2,
      title: "Cotisations URSSAF - T4 2024",
      description: "Paiement des cotisations sociales pour le quatrième trimestre 2024",
      date: "05/01/2025",
      daysRemaining: 12,
      icon: "Building2"
    },
    {
      id: 3,
      title: "Acompte Impôt sur les Sociétés",
      description: "Versement du quatrième acompte d\'impôt sur les sociétés pour l\'exercice 2024",
      date: "31/12/2024",
      daysRemaining: 7,
      icon: "Receipt"
    }
  ];

  const revenueData = [
    { month: "Jan", revenue: 38500, expenses: 22000 },
    { month: "Fév", revenue: 42000, expenses: 24500 },
    { month: "Mar", revenue: 39800, expenses: 23200 },
    { month: "Avr", revenue: 45200, expenses: 26800 },
    { month: "Mai", revenue: 48500, expenses: 28500 },
    { month: "Juin", revenue: 52000, expenses: 30200 },
    { month: "Juil", revenue: 49800, expenses: 29500 },
    { month: "Août", revenue: 41200, expenses: 25800 },
    { month: "Sep", revenue: 46500, expenses: 27500 },
    { month: "Oct", revenue: 50200, expenses: 29800 },
    { month: "Nov", revenue: 48800, expenses: 28900 },
    { month: "Déc", revenue: 45280, expenses: 27200 }
  ];

  const expenseCategories = [
    { name: "Salaires", value: 15800 },
    { name: "Loyer", value: 4500 },
    { name: "Fournitures", value: 2850 },
    { name: "Marketing", value: 3200 },
    { name: "Logiciels", value: 1890 },
    { name: "Autres", value: 1560 }
  ];

  const notifications = [
    {
      id: 1,
      type: "overdue",
      title: "Facture en retard",
      message: "La facture #INV-2024-1245 de Cabinet Bernard est en retard de 5 jours. Montant: 5 800,00 €",
      time: "Il y a 2 heures",
      read: false
    },
    {
      id: 2,
      type: "deadline",
      title: "Échéance fiscale proche",
      message: "La déclaration TVA de décembre 2024 doit être soumise avant le 15/01/2025",
      time: "Il y a 5 heures",
      read: false
    },
    {
      id: 3,
      type: "payment",
      title: "Paiement reçu",
      message: "Paiement de 4 850,00 € reçu de SARL Dupont & Associés pour la facture #INV-2024-1247",
      time: "Il y a 1 jour",
      read: false
    },
    {
      id: 4,
      type: "warning",
      title: "Cotisations URSSAF",
      message: "Le paiement des cotisations URSSAF T4 2024 est dû dans 12 jours",
      time: "Il y a 1 jour",
      read: true
    }
  ];

  const handleQuickAction = (actionType) => {
    trackEngagement?.dashboardAction(actionType);
    
    // ... existing quick action logic ...
  };

  const handleNotificationClick = (notification) => {
    trackEngagement?.dashboardAction('notification_click');
    
    // ... existing notification logic ...
  };

  const handleMetricClick = (metricType) => {
    trackEngagement?.dashboardAction(`metric_view_${metricType}`);
    
    // ... existing metric navigation logic ...
  };

  return (
    <>
      <Helmet>
        <title>Tableau de Bord - ComptaFlow</title>
        <meta name="description" content="Vue d'ensemble complète de vos finances d'entreprise avec métriques clés, transactions récentes et échéances fiscales" />
      </Helmet>
      <div className="min-h-screen bg-background">
        <NavigationSidebar 
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        <main 
          className={`
            transition-smooth pt-20 lg:pt-0
            ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-60'}
          `}
        >
          <div className="p-4 md:p-6 lg:p-8">
            <BreadcrumbTrail />

            <div className="mb-6 md:mb-8">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-heading font-semibold text-foreground mb-2">
                Tableau de Bord
              </h1>
              <p className="text-sm md:text-base text-muted-foreground">
                Vue d'ensemble de vos finances et activités commerciales
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
              {metrics?.map((metric, index) => (
                <MetricCard key={index} {...metric} />
              ))}
            </div>

            <div className="mb-6 md:mb-8">
              <QuickActionButtons />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
              <div className="lg:col-span-2">
                <RecentTransactionsTable transactions={recentTransactions} />
              </div>
              <div className="lg:col-span-1">
                <TaxDeadlinesPanel deadlines={taxDeadlines} />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
              <RevenueChart data={revenueData} />
              <ExpenseCategoryChart data={expenseCategories} />
            </div>

            <div className="mb-6 md:mb-8">
              <NotificationCenter notifications={notifications} />
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Dashboard;