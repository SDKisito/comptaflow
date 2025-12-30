import React from 'react';
import Icon from '../../../components/AppIcon';

const ExpenseSummaryCards = ({ expenses }) => {
  const calculateTotals = () => {
    const total = expenses?.reduce((sum, exp) => sum + parseFloat(exp?.totalAmount), 0);
    const deductible = expenses?.filter(exp => exp?.isDeductible)?.reduce((sum, exp) => sum + parseFloat(exp?.totalAmount), 0);
    const tva = expenses?.reduce((sum, exp) => sum + parseFloat(exp?.tvaAmount), 0);
    const count = expenses?.length;

    return { total, deductible, tva, count };
  };

  const totals = calculateTotals();

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    })?.format(amount);
  };

  const cards = [
    {
      title: 'Total des dépenses',
      value: formatAmount(totals?.total),
      icon: 'Wallet',
      color: 'var(--color-primary)',
      bgColor: 'var(--color-primary)',
      description: `${totals?.count} dépense${totals?.count > 1 ? 's' : ''} enregistrée${totals?.count > 1 ? 's' : ''}`
    },
    {
      title: 'Dépenses déductibles',
      value: formatAmount(totals?.deductible),
      icon: 'CheckCircle2',
      color: 'var(--color-success)',
      bgColor: 'var(--color-success)',
      description: `${((totals?.deductible / totals?.total) * 100 || 0)?.toFixed(1)}% du total`
    },
    {
      title: 'TVA récupérable',
      value: formatAmount(totals?.tva),
      icon: 'Receipt',
      color: 'var(--color-warning)',
      bgColor: 'var(--color-warning)',
      description: 'Montant total de TVA'
    },
    {
      title: 'Moyenne par dépense',
      value: formatAmount(totals?.total / totals?.count || 0),
      icon: 'TrendingUp',
      color: '#8B5CF6',
      bgColor: '#8B5CF6',
      description: 'Montant moyen TTC'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {cards?.map((card, index) => (
        <div
          key={index}
          className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-elevation-1 hover:shadow-elevation-2 transition-smooth"
        >
          <div className="flex items-start justify-between mb-3">
            <div
              className="w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${card?.bgColor}15` }}
            >
              <Icon name={card?.icon} size={20} color={card?.color} />
            </div>
          </div>
          <h3 className="text-xs md:text-sm font-medium text-muted-foreground mb-1">
            {card?.title}
          </h3>
          <p className="text-xl md:text-2xl font-semibold text-foreground data-text mb-1">
            {card?.value}
          </p>
          <p className="text-xs text-muted-foreground">{card?.description}</p>
        </div>
      ))}
    </div>
  );
};

export default ExpenseSummaryCards;