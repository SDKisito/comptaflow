import React from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const BulkActionsBar = ({ selectedCount, onSendBulk, onMarkPaidBulk, onDeleteBulk, onClearSelection }) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-card border border-border rounded-lg shadow-elevation-4 px-4 md:px-6 py-3">
      <div className="flex items-center gap-3 md:gap-4">
        <div className="flex items-center gap-2">
          {/* ✅ icône corrigée */}
          <Icon name="checkSquare" size={20} color="var(--color-primary)" />
          <span className="font-medium text-foreground">
            <span className="font-semibold text-primary">{selectedCount}</span>{' '}
            facture{selectedCount > 1 ? 's' : ''} sélectionnée{selectedCount > 1 ? 's' : ''}
          </span>
        </div>

        <div className="h-6 w-px bg-border" />

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onSendBulk}
            iconName="send"          // ✅ corrigé
            iconPosition="left"
          >
            Envoyer
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onMarkPaidBulk}
            iconName="checkCircle"   // ✅ corrigé
            iconPosition="left"
          >
            Marquer payées
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={onDeleteBulk}
            iconName="trash2"        // ✅ corrigé
            iconPosition="left"
          >
            Supprimer
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            iconName="x"             // ✅ corrigé
          >
            Annuler
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BulkActionsBar;
