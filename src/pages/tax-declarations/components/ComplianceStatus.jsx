import React from 'react';
import Icon from '../../../components/AppIcon';

const ComplianceStatus = ({ status }) => {
  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-elevation-1">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading font-semibold text-base md:text-lg text-foreground">
          Statut de conformité
        </h3>
        <Icon name="Shield" size={20} color="var(--color-success)" />
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-success bg-opacity-10 rounded-md">
          <div className="flex items-center gap-3">
            <Icon name="CheckCircle" size={20} color="var(--color-success)" />
            <span className="font-medium text-sm text-foreground">Déclarations à jour</span>
          </div>
          <span className="font-heading font-semibold text-lg text-success data-text">
            {status?.upToDate}
          </span>
        </div>

        <div className="flex items-center justify-between p-4 bg-warning bg-opacity-10 rounded-md">
          <div className="flex items-center gap-3">
            <Icon name="Clock" size={20} color="var(--color-warning)" />
            <span className="font-medium text-sm text-foreground">En attente</span>
          </div>
          <span className="font-heading font-semibold text-lg text-warning data-text">
            {status?.pending}
          </span>
        </div>

        <div className="flex items-center justify-between p-4 bg-error bg-opacity-10 rounded-md">
          <div className="flex items-center gap-3">
            <Icon name="AlertTriangle" size={20} color="var(--color-error)" />
            <span className="font-medium text-sm text-foreground">En retard</span>
          </div>
          <span className="font-heading font-semibold text-lg text-error data-text">
            {status?.overdue}
          </span>
        </div>

        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Taux de conformité</span>
            <span className="font-heading font-semibold text-base text-success data-text">
              {status?.complianceRate}%
            </span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-success transition-smooth"
              style={{ width: `${status?.complianceRate}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplianceStatus;