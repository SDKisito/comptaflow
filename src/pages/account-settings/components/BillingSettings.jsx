import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const BillingSettings = () => {
  const [selectedPlan, setSelectedPlan] = useState('professional');

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: '0',
      period: 'mois',
      features: [
        'Jusqu\'à 50 factures/mois',
        '2 utilisateurs',
        'Support email',
        'Stockage 5 GB',
        'Déclarations TVA basiques'
      ],
      recommended: false
    },
    {
      id: 'professional',
      name: 'Professionnel',
      price: '49,99',
      period: 'mois',
      features: [
        'Factures illimitées',
        '10 utilisateurs',
        'Support prioritaire',
        'Stockage 50 GB',
        'Toutes déclarations fiscales',
        'Intégrations bancaires',
        'Rapports avancés'
      ],
      recommended: true
    },
    {
      id: 'enterprise',
      name: 'Entreprise',
      price: '99,99',
      period: 'mois',
      features: [
        'Tout du plan Professionnel',
        'Utilisateurs illimités',
        'Support dédié 24/7',
        'Stockage illimité',
        'API personnalisée',
        'Formation sur site',
        'Gestionnaire de compte'
      ],
      recommended: false
    }
  ];

  const paymentMethods = [
    {
      id: 1,
      type: 'card',
      brand: 'Visa',
      last4: '4242',
      expiry: '12/2025',
      isDefault: true
    },
    {
      id: 2,
      type: 'card',
      brand: 'Mastercard',
      last4: '8888',
      expiry: '06/2026',
      isDefault: false
    }
  ];

  const invoiceHistory = [
    {
      id: 'INV-2024-12',
      date: '01/12/2024',
      amount: '79,00',
      status: 'paid',
      downloadUrl: '#'
    },
    {
      id: 'INV-2024-11',
      date: '01/11/2024',
      amount: '79,00',
      status: 'paid',
      downloadUrl: '#'
    },
    {
      id: 'INV-2024-10',
      date: '01/10/2024',
      amount: '79,00',
      status: 'paid',
      downloadUrl: '#'
    }
  ];

  const getStatusBadge = (status) => {
    const styles = {
      paid: 'bg-success/10 text-success',
      pending: 'bg-warning/10 text-warning',
      failed: 'bg-error/10 text-error'
    };
    const labels = {
      paid: 'Payée',
      pending: 'En attente',
      failed: 'Échouée'
    };
    return (
      <span className={`px-2 py-1 rounded-md text-xs font-medium ${styles?.[status]}`}>
        {labels?.[status]}
      </span>
    );
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="bg-card rounded-lg border border-border p-4 md:p-6 lg:p-8">
        <h3 className="text-lg font-heading font-semibold text-foreground mb-6">
          Abonnement Actuel
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {plans?.map((plan) => (
            <div
              key={plan?.id}
              className={`
                relative rounded-lg border-2 p-4 md:p-6 transition-smooth
                ${selectedPlan === plan?.id
                  ? 'border-primary bg-primary/5' :'border-border bg-card hover:border-primary/50'
                }
              `}
            >
              {plan?.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
                    Recommandé
                  </span>
                </div>
              )}
              
              <div className="text-center mb-4">
                <h4 className="text-xl font-heading font-semibold text-foreground mb-2">
                  {plan?.name}
                </h4>
                <div className="flex items-baseline justify-center">
                  <span className="text-3xl md:text-4xl font-heading font-bold text-foreground">
                    {plan?.price}€
                  </span>
                  <span className="text-muted-foreground ml-2">/{plan?.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {plan?.features?.map((feature, index) => (
                  <li key={index} className="flex items-start text-sm">
                    <Icon
                      name="Check"
                      size={16}
                      color="var(--color-success)"
                      className="flex-shrink-0 mt-0.5 mr-2"
                    />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={selectedPlan === plan?.id ? 'default' : 'outline'}
                fullWidth
                onClick={() => setSelectedPlan(plan?.id)}
              >
                {selectedPlan === plan?.id ? 'Plan Actuel' : 'Choisir ce Plan'}
              </Button>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-card rounded-lg border border-border p-4 md:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h3 className="text-lg font-heading font-semibold text-foreground mb-4 sm:mb-0">
            Moyens de Paiement
          </h3>
          <Button variant="outline" iconName="Plus" iconPosition="left">
            Ajouter une Carte
          </Button>
        </div>

        <div className="space-y-4">
          {paymentMethods?.map((method) => (
            <div
              key={method?.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border border-border rounded-lg"
            >
              <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                <div className="w-12 h-8 bg-muted rounded flex items-center justify-center">
                  <Icon name="CreditCard" size={20} color="var(--color-foreground)" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-foreground">
                      {method?.brand} •••• {method?.last4}
                    </span>
                    {method?.isDefault && (
                      <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-md">
                        Par défaut
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Expire le {method?.expiry}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                {!method?.isDefault && (
                  <Button variant="ghost" size="sm">
                    Définir par défaut
                  </Button>
                )}
                <Button variant="ghost" size="sm" iconName="Trash2">
                  Supprimer
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-card rounded-lg border border-border p-4 md:p-6 lg:p-8">
        <h3 className="text-lg font-heading font-semibold text-foreground mb-6">
          Historique de Facturation
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Facture
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Date
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Montant
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Statut
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {invoiceHistory?.map((invoice) => (
                <tr key={invoice?.id} className="border-b border-border last:border-0">
                  <td className="py-3 px-4 text-sm font-medium text-foreground">
                    {invoice?.id}
                  </td>
                  <td className="py-3 px-4 text-sm text-foreground">
                    {invoice?.date}
                  </td>
                  <td className="py-3 px-4 text-sm font-medium text-foreground">
                    {invoice?.amount} €
                  </td>
                  <td className="py-3 px-4">
                    {getStatusBadge(invoice?.status)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      iconName="Download"
                      onClick={() => window.open(invoice?.downloadUrl, '_blank')}
                    >
                      Télécharger
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="bg-card rounded-lg border border-border p-4 md:p-6 lg:p-8">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <Icon name="Info" size={24} color="var(--color-primary)" />
          </div>
          <div className="flex-1">
            <h4 className="text-base font-heading font-semibold text-foreground mb-2">
              Renouvellement Automatique
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
              Votre abonnement sera automatiquement renouvelé le 1er janvier 2025. Vous pouvez annuler à tout moment avant cette date sans frais supplémentaires.
            </p>
            <Button variant="outline" iconName="X">
              Annuler l'Abonnement
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingSettings;
