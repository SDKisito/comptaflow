import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const DeclarationCard = ({ declaration, onPrepare, onView }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'overdue':
        return 'bg-error text-error-foreground';
      case 'due-soon':
        return 'bg-warning text-warning-foreground';
      case 'submitted':
        return 'bg-success text-success-foreground';
      case 'draft':
        return 'bg-secondary text-secondary-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'overdue':
        return 'AlertCircle';
      case 'due-soon':
        return 'Clock';
      case 'submitted':
        return 'CheckCircle';
      case 'draft':
        return 'FileEdit';
      default:
        return 'File';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'overdue':
        return 'En retard';
      case 'due-soon':
        return 'À échoir bientôt';
      case 'submitted':
        return 'Soumis';
      case 'draft':
        return 'Brouillon';
      default:
        return 'En attente';
    }
  };

  const getDaysRemaining = () => {
    const today = new Date();
    const deadline = new Date(declaration.deadline);
    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `${Math.abs(diffDays)} jours de retard`;
    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return "Demain";
    return `${diffDays} jours restants`;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-elevation-1 hover:shadow-elevation-2 transition-smooth">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3 mb-3">
            <div className={`flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-md ${getStatusColor(declaration?.status)} bg-opacity-10 flex-shrink-0`}>
              <Icon 
                name={declaration?.icon} 
                size={20} 
                color={`var(--color-${declaration?.status === 'overdue' ? 'error' : declaration?.status === 'due-soon' ? 'warning' : declaration?.status === 'submitted' ? 'success' : 'secondary'})`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-heading font-semibold text-base md:text-lg text-foreground mb-1">
                {declaration?.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {declaration?.period}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Icon name="Calendar" size={16} color="var(--color-muted-foreground)" />
              <span className="text-sm text-foreground">
                <span className="text-muted-foreground">Échéance:</span> {new Date(declaration.deadline)?.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name={getStatusIcon(declaration?.status)} size={16} color="var(--color-muted-foreground)" />
              <span className={`text-sm font-medium px-2 py-0.5 rounded-md ${getStatusColor(declaration?.status)} bg-opacity-10`}>
                {getStatusLabel(declaration?.status)}
              </span>
            </div>
          </div>

          {declaration?.status !== 'submitted' && (
            <div className={`flex items-center gap-2 p-3 rounded-md ${declaration?.status === 'overdue' ? 'bg-error' : 'bg-warning'} bg-opacity-10 mb-4`}>
              <Icon 
                name={declaration?.status === 'overdue' ? 'AlertTriangle' : 'Clock'} 
                size={16} 
                color={`var(--color-${declaration?.status === 'overdue' ? 'error' : 'warning'})`}
              />
              <span className={`text-sm font-medium ${declaration?.status === 'overdue' ? 'text-error' : 'text-warning'}`}>
                {getDaysRemaining()}
              </span>
            </div>
          )}

          {declaration?.amount && (
            <div className="flex items-center justify-between p-3 bg-muted rounded-md mb-4">
              <span className="text-sm text-muted-foreground">Montant estimé</span>
              <span className="font-heading font-semibold text-lg text-foreground data-text">
                {declaration?.amount?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
              </span>
            </div>
          )}

          {declaration?.submitted && (
            <div className="flex items-center gap-2 text-sm text-success mb-4">
              <Icon name="CheckCircle" size={16} color="var(--color-success)" />
              <span>Soumis le {new Date(declaration.submitted)?.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 lg:w-40">
          {declaration?.status === 'submitted' ? (
            <Button
              variant="outline"
              size="default"
              iconName="Eye"
              iconPosition="left"
              onClick={() => onView(declaration)}
              fullWidth
            >
              Voir
            </Button>
          ) : (
            <Button
              variant={declaration?.status === 'overdue' ? 'destructive' : 'default'}
              size="default"
              iconName="FileEdit"
              iconPosition="left"
              onClick={() => onPrepare(declaration)}
              fullWidth
            >
              {declaration?.status === 'draft' ? 'Continuer' : 'Préparer'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeclarationCard;