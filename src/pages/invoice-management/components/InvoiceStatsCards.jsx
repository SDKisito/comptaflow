import React from 'react';
import Icon from '../../../components/AppIcon';

const InvoiceStatsCards = ({ stats }) => {
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })?.format(amount);
  };

  const cards = [
    {
      title: 'Total des factures',
      value: stats?.totalInvoices,
      icon: 'fileText',
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      title: 'Montant total',
      value: formatAmount(stats?.totalAmount),
      icon: 'euro',
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      title: 'Factures payées',
      value: stats?.paidInvoices,
      icon: 'checkCircle',
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      title: 'En attente',
      value: stats?.pendingInvoices,
      icon: 'clock',
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    },
    {
      title: 'En retard',
      value: stats?.overdueInvoices,
      icon: 'alertCircle',
      color: 'text-error',
      bgColor: 'bg-error/10'
    },
    {
      title: 'Brouillons',
      value: stats?.draftInvoices,
      icon: 'fileEdit',
      color: 'text-muted-foreground',
      bgColor: 'bg-muted'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards?.map((card, index) => (
        <div key={index} className="bg-card border border-border rounded-lg p-4 shadow-elevation-1 hover:shadow-elevation-2 transition-smooth">
          <div className="flex items-start justify-between mb-3">
            <div className={`w-10 h-10 rounded-lg ${card?.bgColor} flex items-center justify-center`}>
              <Icon name={card?.icon} size={20} color={`var(--color-${card?.color?.replace('text-', '')})`} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mb-1">{card?.title}</p>
          <p className={`text-xl md:text-2xl font-bold ${card?.color} data-text`}>{card?.value}</p>
        </div>
      ))}
    </div>
  );
};

export default InvoiceStatsCards;
