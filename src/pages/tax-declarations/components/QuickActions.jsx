import React from 'react';
import Button from '../../../components/ui/Button';

const QuickActions = ({ onAction }) => {
  const actions = [
    {
      id: 'new-tva',
      label: 'Nouvelle déclaration TVA',
      icon: 'Plus',
      variant: 'default'
    },
    {
      id: 'import-data',
      label: 'Importer des données',
      icon: 'Upload',
      variant: 'outline'
    },
    {
      id: 'export-report',
      label: 'Exporter un rapport',
      icon: 'Download',
      variant: 'outline'
    },
    {
      id: 'view-history',
      label: 'Historique',
      icon: 'History',
      variant: 'outline'
    }
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-elevation-1">
      <h3 className="font-heading font-semibold text-base md:text-lg text-foreground mb-4">
        Actions rapides
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {actions?.map((action) => (
          <Button
            key={action?.id}
            variant={action?.variant}
            size="default"
            iconName={action?.icon}
            iconPosition="left"
            onClick={() => onAction(action?.id)}
            fullWidth
          >
            {action?.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;