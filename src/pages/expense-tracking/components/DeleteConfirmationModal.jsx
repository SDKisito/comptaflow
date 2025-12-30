import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, expense }) => {
  if (!isOpen || !expense) return null;

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    })?.format(amount);
  };

  return (
    <div className="fixed inset-0 z-150 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-lg shadow-elevation-4 w-full max-w-md">
        <div className="p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <Icon name="AlertTriangle" size={24} color="var(--color-destructive)" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-heading font-semibold text-foreground mb-2">
                Confirmer la suppression
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Êtes-vous sûr de vouloir supprimer cette dépense ? Cette action est irréversible.
              </p>
              <div className="bg-muted rounded-lg p-3 space-y-1">
                <p className="text-sm font-medium text-foreground">{expense?.description}</p>
                <p className="text-xs text-muted-foreground">{expense?.categoryLabel}</p>
                <p className="text-sm font-semibold text-destructive data-text">
                  {formatAmount(expense?.totalAmount)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              fullWidth
              className="sm:flex-1"
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              iconName="Trash2"
              iconPosition="left"
              onClick={onConfirm}
              fullWidth
              className="sm:flex-1"
            >
              Supprimer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;