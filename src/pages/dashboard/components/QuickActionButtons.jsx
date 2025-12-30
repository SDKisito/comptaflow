import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';

const QuickActionButtons = () => {
  const navigate = useNavigate();

  const actions = [
    {
      label: 'Créer Facture',
      icon: 'FilePlus',
      variant: 'default',
      onClick: () => navigate('/invoice-management')
    },
    {
      label: 'Ajouter Dépense',
      icon: 'ReceiptText',
      variant: 'outline',
      onClick: () => navigate('/expense-tracking')
    },
    {
      label: 'Voir Rapports',
      icon: 'BarChart3',
      variant: 'secondary',
      onClick: () => navigate('/financial-reports')
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
      {actions?.map((action, index) => (
        <Button
          key={index}
          variant={action?.variant}
          iconName={action?.icon}
          iconPosition="left"
          onClick={action?.onClick}
          fullWidth
          className="h-12 md:h-14"
        >
          {action?.label}
        </Button>
      ))}
    </div>
  );
};

export default QuickActionButtons;