import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const IntegrationSettings = () => {
  const [integrations, setIntegrations] = useState([
    {
      id: 'dgfip',
      name: 'DGFIP (Impôts)',
      description: 'Connexion directe avec la Direction Générale des Finances Publiques pour les déclarations fiscales',
      icon: 'FileText',
      status: 'connected',
      lastSync: '24/12/2024 08:30',
      features: ['Déclarations TVA', 'Déclarations revenus', 'Télépaiement']
    },
    {
      id: 'urssaf',
      name: 'URSSAF',
      description: 'Intégration pour les déclarations sociales et le paiement des cotisations',
      icon: 'Users',
      status: 'connected',
      lastSync: '23/12/2024 15:45',
      features: ['DSN', 'Cotisations sociales', 'Attestations']
    },
    {
      id: 'banking',
      name: 'Banques Françaises',
      description: 'Synchronisation automatique avec vos comptes bancaires professionnels',
      icon: 'Building',
      status: 'connected',
      lastSync: '24/12/2024 09:00',
      features: ['Relevés bancaires', 'Rapprochement', 'Virements']
    },
    {
      id: 'stripe',
      name: 'Stripe',
      description: 'Plateforme de paiement en ligne pour vos transactions e-commerce',
      icon: 'CreditCard',
      status: 'disconnected',
      lastSync: null,
      features: ['Paiements en ligne', 'Abonnements', 'Facturation']
    },
    {
      id: 'paypal',
      name: 'PayPal',
      description: 'Solution de paiement internationale pour vos clients',
      icon: 'Wallet',
      status: 'disconnected',
      lastSync: null,
      features: ['Paiements', 'Remboursements', 'Facturation']
    },
    {
      id: 'quickbooks',
      name: 'QuickBooks',
      description: 'Synchronisation avec votre logiciel de comptabilité QuickBooks',
      icon: 'BookOpen',
      status: 'disconnected',
      lastSync: null,
      features: ['Export données', 'Synchronisation', 'Rapports']
    }
  ]);

  const handleToggleIntegration = (integrationId) => {
    setIntegrations(prev =>
      prev?.map(integration =>
        integration?.id === integrationId
          ? {
              ...integration,
              status: integration?.status === 'connected' ? 'disconnected' : 'connected',
              lastSync: integration?.status === 'connected' ? null : new Date()?.toLocaleString('fr-FR')
            }
          : integration
      )
    );
  };

  const getStatusBadge = (status) => {
    if (status === 'connected') {
      return (
        <span className="flex items-center space-x-1 px-2 py-1 bg-success/10 text-success rounded-md text-xs font-medium">
          <Icon name="CheckCircle" size={14} color="var(--color-success)" />
          <span>Connecté</span>
        </span>
      );
    }
    return (
      <span className="flex items-center space-x-1 px-2 py-1 bg-muted text-muted-foreground rounded-md text-xs font-medium">
        <Icon name="Circle" size={14} color="var(--color-muted-foreground)" />
        <span>Déconnecté</span>
      </span>
    );
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="bg-card rounded-lg border border-border p-4 md:p-6 lg:p-8">
        <div className="flex items-start space-x-4 mb-6">
          <div className="flex-shrink-0">
            <Icon name="Info" size={24} color="var(--color-primary)" />
          </div>
          <div className="flex-1">
            <h4 className="text-base font-heading font-semibold text-foreground mb-2">
              Gestion des Intégrations
            </h4>
            <p className="text-sm text-muted-foreground">
              Connectez ComptaFlow à vos services préférés pour automatiser vos flux de travail et synchroniser vos données financières en temps réel. Toutes les connexions sont sécurisées et conformes aux normes RGPD.
            </p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {integrations?.map((integration) => (
          <div
            key={integration?.id}
            className="bg-card rounded-lg border border-border p-4 md:p-6 transition-smooth hover:shadow-elevation-2"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon name={integration?.icon} size={24} color="var(--color-primary)" />
                </div>
                <div className="flex-1">
                  <h4 className="text-base font-heading font-semibold text-foreground mb-1">
                    {integration?.name}
                  </h4>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {integration?.description}
                  </p>
                </div>
              </div>
              {getStatusBadge(integration?.status)}
            </div>

            <div className="mb-4">
              <h5 className="text-xs font-medium text-muted-foreground uppercase mb-2">
                Fonctionnalités
              </h5>
              <div className="flex flex-wrap gap-2">
                {integration?.features?.map((feature, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-muted text-foreground text-xs rounded-md"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            {integration?.lastSync && (
              <div className="flex items-center space-x-2 mb-4 text-xs text-muted-foreground">
                <Icon name="RefreshCw" size={14} color="var(--color-muted-foreground)" />
                <span>Dernière synchronisation: {integration?.lastSync}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant={integration?.status === 'connected' ? 'destructive' : 'default'}
                size="sm"
                iconName={integration?.status === 'connected' ? 'Unlink' : 'Link'}
                iconPosition="left"
                onClick={() => handleToggleIntegration(integration?.id)}
                fullWidth
              >
                {integration?.status === 'connected' ? 'Déconnecter' : 'Connecter'}
              </Button>
              {integration?.status === 'connected' && (
                <Button
                  variant="outline"
                  size="sm"
                  iconName="Settings"
                  fullWidth
                >
                  Configurer
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="bg-card rounded-lg border border-border p-4 md:p-6 lg:p-8">
        <h3 className="text-lg font-heading font-semibold text-foreground mb-4">
          Demander une Nouvelle Intégration
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Vous utilisez un service qui n'est pas encore intégré à ComptaFlow ? Faites-nous part de vos besoins et nous étudierons la possibilité d'ajouter cette intégration.
        </p>
        <Button variant="outline" iconName="Plus" iconPosition="left">
          Suggérer une Intégration
        </Button>
      </div>
      <div className="bg-card rounded-lg border border-border p-4 md:p-6 lg:p-8">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <Icon name="Shield" size={24} color="var(--color-success)" />
          </div>
          <div className="flex-1">
            <h4 className="text-base font-heading font-semibold text-foreground mb-2">
              Sécurité des Intégrations
            </h4>
            <p className="text-sm text-muted-foreground">
              Toutes les intégrations utilisent des protocoles de sécurité avancés (OAuth 2.0, chiffrement SSL/TLS) et sont conformes aux réglementations RGPD. Vos données sont protégées et ne sont jamais partagées sans votre consentement explicite.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationSettings;