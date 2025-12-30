import React from 'react';
import Icon from '../../../components/AppIcon';

const SettingsTabNavigation = ({ activeTab, onTabChange }) => {
  const tabs = [
    {
      id: 'profile',
      label: 'Profil',
      icon: 'User',
      description: 'Informations personnelles'
    },
    {
      id: 'company',
      label: 'Entreprise',
      icon: 'Building2',
      description: 'Détails de l\'entreprise'
    },
    {
      id: 'billing',
      label: 'Facturation',
      icon: 'CreditCard',
      description: 'Abonnement et paiements'
    },
    {
      id: 'security',
      label: 'Sécurité',
      icon: 'Shield',
      description: 'Mot de passe et authentification'
    },
    {
      id: 'integrations',
      label: 'Intégrations',
      icon: 'Plug',
      description: 'Connexions externes'
    },
    {
      id: 'team',
      label: 'Équipe',
      icon: 'Users',
      description: 'Gestion des accès'
    },
    {
      id: 'data',
      label: 'Données',
      icon: 'Database',
      description: 'Sauvegarde et export'
    }
  ];

  return (
    <div className="bg-card border-b border-border overflow-x-auto">
      <nav className="flex space-x-1 px-4 md:px-6 lg:px-8" aria-label="Settings navigation">
        {tabs?.map((tab) => (
          <button
            key={tab?.id}
            onClick={() => onTabChange(tab?.id)}
            className={`
              flex items-center space-x-2 px-4 py-3 border-b-2 transition-smooth
              whitespace-nowrap flex-shrink-0
              ${activeTab === tab?.id
                ? 'border-primary text-primary font-medium' :'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }
            `}
            aria-current={activeTab === tab?.id ? 'page' : undefined}
          >
            <Icon
              name={tab?.icon}
              size={18}
              color={activeTab === tab?.id ? 'var(--color-primary)' : 'var(--color-muted-foreground)'}
            />
            <span className="text-sm md:text-base">{tab?.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default SettingsTabNavigation;