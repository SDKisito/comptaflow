import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ExpenseListItem = ({ expense, onEdit, onDelete, onViewReceipt }) => {
  const getCategoryIcon = (category) => {
    const iconMap = {
      fournitures: 'Package',
      loyer: 'Home',
      transport: 'Car',
      repas: 'Utensils',
      telecom: 'Phone',
      marketing: 'TrendingUp',
      formation: 'GraduationCap',
      assurance: 'Shield',
      honoraires: 'Briefcase',
      maintenance: 'Wrench',
      abonnements: 'CreditCard',
      autres: 'MoreHorizontal'
    };
    return iconMap?.[category] || 'FileText';
  };

  const getCategoryColor = (category) => {
    const colorMap = {
      fournitures: 'var(--color-primary)',
      loyer: 'var(--color-warning)',
      transport: 'var(--color-success)',
      repas: '#F59E0B',
      telecom: '#8B5CF6',
      marketing: '#EC4899',
      formation: '#06B6D4',
      assurance: '#10B981',
      honoraires: '#6366F1',
      maintenance: '#F97316',
      abonnements: '#3B82F6',
      autres: 'var(--color-muted-foreground)'
    };
    return colorMap?.[category] || 'var(--color-foreground)';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date?.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    })?.format(amount);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 hover:shadow-elevation-2 transition-smooth">
      <div className="flex items-start gap-3 md:gap-4">
        <div
          className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${getCategoryColor(expense?.category)}15` }}
        >
          <Icon
            name={getCategoryIcon(expense?.category)}
            size={20}
            color={getCategoryColor(expense?.category)}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm md:text-base font-medium text-foreground truncate">
                {expense?.description}
              </h3>
              <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                {expense?.categoryLabel}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-base md:text-lg font-semibold text-foreground data-text">
                {formatAmount(expense?.totalAmount)}
              </p>
              <p className="text-xs text-muted-foreground">
                HT: {formatAmount(expense?.amount)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 md:gap-3 text-xs md:text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Icon name="Calendar" size={14} color="var(--color-muted-foreground)" />
              <span>{formatDate(expense?.date)}</span>
            </div>

            <div className="flex items-center gap-1">
              <Icon name="Receipt" size={14} color="var(--color-muted-foreground)" />
              <span>TVA {expense?.tvaRate}%</span>
            </div>

            {expense?.isDeductible && (
              <div className="flex items-center gap-1 text-success">
                <Icon name="CheckCircle2" size={14} color="var(--color-success)" />
                <span className="font-medium">Déductible</span>
              </div>
            )}

            {expense?.receiptName && (
              <button
                onClick={() => onViewReceipt(expense)}
                className="flex items-center gap-1 text-primary hover:underline transition-smooth"
              >
                <Icon name="Paperclip" size={14} color="var(--color-primary)" />
                <span>Justificatif</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              iconName="Edit"
              iconPosition="left"
              onClick={() => onEdit(expense)}
            >
              Modifier
            </Button>
            <Button
              variant="ghost"
              size="sm"
              iconName="Trash2"
              iconPosition="left"
              onClick={() => onDelete(expense)}
              className="text-destructive hover:text-destructive"
            >
              Supprimer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseListItem;