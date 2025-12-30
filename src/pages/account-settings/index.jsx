import React, { useState } from 'react';
import NavigationSidebar from '../../components/ui/NavigationSidebar';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import SettingsTabNavigation from './components/SettingsTabNavigation';
import ProfileSettings from './components/ProfileSettings';
import CompanySettings from './components/CompanySettings';
import BillingSettings from './components/BillingSettings';
import SecuritySettings from './components/SecuritySettings';
import IntegrationSettings from './components/IntegrationSettings';
import TeamSettings from './components/TeamSettings';
import DataSettings from './components/DataSettings';

const AccountSettings = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSettings />;
      case 'company':
        return <CompanySettings />;
      case 'billing':
        return <BillingSettings />;
      case 'security':
        return <SecuritySettings />;
      case 'integrations':
        return <IntegrationSettings />;
      case 'team':
        return <TeamSettings />;
      case 'data':
        return <DataSettings />;
      default:
        return <ProfileSettings />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <NavigationSidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      <main
        className={`
          transition-smooth
          ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-60'}
        `}
      >
        <div className="px-4 md:px-6 lg:px-8 py-6 md:py-8">
          <BreadcrumbTrail />

          <div className="mb-6 md:mb-8">
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-2">
              Paramètres du Compte
            </h1>
            <p className="text-base md:text-lg text-muted-foreground">
              Gérez vos préférences, sécurité et paramètres d'entreprise
            </p>
          </div>

          <div className="bg-card rounded-lg border border-border shadow-elevation-1 overflow-hidden">
            <SettingsTabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
            
            <div className="p-4 md:p-6 lg:p-8">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AccountSettings;