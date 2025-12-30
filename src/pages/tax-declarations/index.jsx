import React, { useState } from 'react';
import NavigationSidebar from '../../components/ui/NavigationSidebar';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import Icon from '../../components/AppIcon';
import DeclarationCard from './components/DeclarationCard';
import DeclarationTypeFilter from './components/DeclarationTypeFilter';
import UpcomingDeadlines from './components/UpcomingDeadlines';
import ComplianceStatus from './components/ComplianceStatus';
import QuickActions from './components/QuickActions';
import DeclarationPreparationModal from './components/DeclarationPreparationModal';
import DeclarationViewModal from './components/DeclarationViewModal';
import { trackFeature } from '../../utils/analytics';

const TaxDeclarations = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedDeclaration, setSelectedDeclaration] = useState(null);
  const [isPreparationModalOpen, setIsPreparationModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const declarations = [
    {
      id: 1,
      title: "Déclaration TVA - T4 2024",
      type: "tva",
      period: "Octobre - Décembre 2024",
      deadline: "2025-01-20",
      status: "overdue",
      amount: 4250.00,
      icon: "Receipt"
    },
    {
      id: 2,
      title: "Cotisations URSSAF - T4 2024",
      type: "urssaf",
      period: "Octobre - Décembre 2024",
      deadline: "2025-01-15",
      status: "overdue",
      amount: 3180.00,
      icon: "Users"
    },
    {
      id: 3,
      title: "Déclaration TVA - T1 2025",
      type: "tva",
      period: "Janvier - Mars 2025",
      deadline: "2025-04-20",
      status: "due-soon",
      amount: 3890.00,
      icon: "Receipt"
    },
    {
      id: 4,
      title: "Impôt sur le revenu 2024",
      type: "income",
      period: "Année fiscale 2024",
      deadline: "2025-05-31",
      status: "draft",
      amount: 12500.00,
      icon: "TrendingUp"
    },
    {
      id: 5,
      title: "Cotisations URSSAF - T1 2025",
      type: "urssaf",
      period: "Janvier - Mars 2025",
      deadline: "2025-04-15",
      status: "pending",
      amount: 3420.00,
      icon: "Users"
    },
    {
      id: 6,
      title: "Déclaration TVA - T3 2024",
      type: "tva",
      period: "Juillet - Septembre 2024",
      deadline: "2024-10-20",
      status: "submitted",
      amount: 4100.00,
      submitted: "2024-10-18",
      icon: "Receipt"
    },
    {
      id: 7,
      title: "Contribution économique territoriale",
      type: "other",
      period: "Année 2024",
      deadline: "2024-12-15",
      status: "submitted",
      amount: 1850.00,
      submitted: "2024-12-10",
      icon: "FileCheck"
    },
    {
      id: 8,
      title: "Impôt sur le revenu 2023",
      type: "income",
      period: "Année fiscale 2023",
      deadline: "2024-05-31",
      status: "submitted",
      amount: 11200.00,
      submitted: "2024-05-28",
      icon: "TrendingUp"
    }
  ];

  const upcomingDeadlines = [
    {
      title: "Déclaration TVA T4 2024",
      date: "2025-01-20",
      daysLeft: -4,
      priority: "high"
    },
    {
      title: "Cotisations URSSAF T4 2024",
      date: "2025-01-15",
      daysLeft: -9,
      priority: "high"
    },
    {
      title: "Déclaration TVA T1 2025",
      date: "2025-04-20",
      daysLeft: 86,
      priority: "medium"
    },
    {
      title: "Cotisations URSSAF T1 2025",
      date: "2025-04-15",
      daysLeft: 81,
      priority: "medium"
    },
    {
      title: "Impôt sur le revenu 2024",
      date: "2025-05-31",
      daysLeft: 127,
      priority: "low"
    }
  ];

  const complianceStatus = {
    upToDate: 3,
    pending: 3,
    overdue: 2,
    complianceRate: 75
  };

  const filteredDeclarations = activeFilter === 'all' 
    ? declarations 
    : declarations?.filter(d => d?.type === activeFilter);

  const handlePrepareDeclaration = (declarationType) => {
    setSelectedDeclaration(declarationType);
    setIsPreparationModalOpen(true);
    trackFeature?.tax?.prepare(declarationType);
  };

  const handleViewDeclaration = (declaration) => {
    setSelectedDeclaration(declaration);
    trackFeature?.tax?.view(declaration?.type);
  };

  const handleSubmitDeclaration = async (declaration) => {
    try {
      // ... existing submit logic ...
      trackFeature?.tax?.submit(declaration?.type);
    } catch (error) {
      console.error('Error submitting declaration:', error);
    }
  };

  const handleQuickAction = (actionId) => {
    console.log('Action rapide:', actionId);
  };

  return (
    <div className="min-h-screen bg-background">
      <NavigationSidebar 
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <main className={`transition-smooth ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-60'}`}>
        <div className="p-4 md:p-6 lg:p-8">
          <BreadcrumbTrail />

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 md:mb-8">
            <div>
              <h1 className="font-heading font-semibold text-2xl md:text-3xl lg:text-4xl text-foreground mb-2">
                Déclarations fiscales
              </h1>
              <p className="text-sm md:text-base text-muted-foreground">
                Gérez vos obligations fiscales et déclarations réglementaires
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-md">
                <Icon name="Calendar" size={18} color="var(--color-muted-foreground)" />
                <span className="text-sm text-foreground">
                  {new Date()?.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            <div className="lg:col-span-1">
              <DeclarationTypeFilter 
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
              />
            </div>

            <div className="lg:col-span-3 space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <ComplianceStatus status={complianceStatus} />
                <UpcomingDeadlines deadlines={upcomingDeadlines} />
              </div>

              <QuickActions onAction={handleQuickAction} />

              <div className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-elevation-1">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <h2 className="font-heading font-semibold text-lg md:text-xl text-foreground">
                    Toutes les déclarations
                  </h2>
                  <span className="text-sm text-muted-foreground">
                    {filteredDeclarations?.length} déclaration{filteredDeclarations?.length > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="space-y-4">
                  {filteredDeclarations?.map((declaration) => (
                    <DeclarationCard
                      key={declaration?.id}
                      declaration={declaration}
                      onPrepare={handlePrepareDeclaration}
                      onView={handleViewDeclaration}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      {isPreparationModalOpen && (
        <DeclarationPreparationModal
          declaration={selectedDeclaration}
          onClose={() => setIsPreparationModalOpen(false)}
          onSubmit={handleSubmitDeclaration}
        />
      )}
      {isViewModalOpen && (
        <DeclarationViewModal
          declaration={selectedDeclaration}
          onClose={() => setIsViewModalOpen(false)}
        />
      )}
    </div>
  );
};

export default TaxDeclarations;