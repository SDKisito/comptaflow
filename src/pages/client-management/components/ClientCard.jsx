import React from 'react';
import Icon from '../../../components/AppIcon';


const ClientCard = ({ client, onSelect, isSelected }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-success/10 text-success';
      case 'inactive':
        return 'bg-muted text-muted-foreground';
      case 'overdue':
        return 'bg-error/10 text-error';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active':
        return 'Actif';
      case 'inactive':
        return 'Inactif';
      case 'overdue':
        return 'En retard';
      default:
        return status;
    }
  };

  return (
    <div
      onClick={() => onSelect(client)}
      className={`
        bg-card border border-border rounded-lg p-4 md:p-5 lg:p-6
        cursor-pointer transition-smooth hover:shadow-elevation-2
        ${isSelected ? 'ring-2 ring-primary shadow-elevation-2' : ''}
      `}
    >
      <div className="flex items-start gap-3 md:gap-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon name="Building2" size={24} color="var(--color-primary)" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-heading font-semibold text-base md:text-lg text-foreground truncate">
              {client?.companyName}
            </h3>
            <span className={`px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap ${getStatusColor(client?.status)}`}>
              {getStatusLabel(client?.status)}
            </span>
          </div>

          <div className="space-y-1.5 md:space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Icon name="User" size={14} color="var(--color-muted-foreground)" />
              <span className="truncate">{client?.contactName}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Icon name="Mail" size={14} color="var(--color-muted-foreground)" />
              <span className="truncate">{client?.email}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Icon name="Phone" size={14} color="var(--color-muted-foreground)" />
              <span>{client?.phone}</span>
            </div>
          </div>

          <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-border flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Solde impayé</p>
              <p className={`font-semibold text-sm md:text-base ${client?.outstandingBalance > 0 ? 'text-error' : 'text-success'}`}>
                {client?.outstandingBalance?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground mb-1">Dernière activité</p>
              <p className="text-xs md:text-sm text-foreground">{client?.lastActivity}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientCard;