import React from 'react';
import Icon from '../../../components/AppIcon';

const DeclarationTypeFilter = ({ activeFilter, onFilterChange }) => {
  const filters = [
    { id: 'all', label: 'Toutes', icon: 'FileText', count: 8 },
    { id: 'tva', label: 'TVA', icon: 'Receipt', count: 3 },
    { id: 'urssaf', label: 'URSSAF', icon: 'Users', count: 2 },
    { id: 'income', label: 'Impôt sur le revenu', icon: 'TrendingUp', count: 2 },
    { id: 'other', label: 'Autres', icon: 'FileCheck', count: 1 }
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-elevation-1">
      <h3 className="font-heading font-semibold text-base md:text-lg text-foreground mb-4">
        Type de déclaration
      </h3>
      <div className="space-y-2">
        {filters?.map((filter) => (
          <button
            key={filter?.id}
            onClick={() => onFilterChange(filter?.id)}
            className={`
              w-full flex items-center justify-between p-3 rounded-md
              transition-smooth
              ${activeFilter === filter?.id
                ? 'bg-primary text-primary-foreground shadow-elevation-1'
                : 'bg-muted hover:bg-muted hover:shadow-elevation-1 text-foreground'
              }
            `}
          >
            <div className="flex items-center gap-3">
              <Icon
                name={filter?.icon}
                size={18}
                color={activeFilter === filter?.id ? 'var(--color-primary-foreground)' : 'var(--color-foreground)'}
              />
              <span className="font-medium text-sm">{filter?.label}</span>
            </div>
            <span className={`
              px-2 py-0.5 rounded-full text-xs font-medium data-text
              ${activeFilter === filter?.id
                ? 'bg-primary-foreground text-primary'
                : 'bg-background text-foreground'
              }
            `}>
              {filter?.count}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DeclarationTypeFilter;