import React from 'react';
import Icon from '../../../components/AppIcon';

const ClientFilters = ({ activeFilter, onFilterChange }) => {
  const filters = [
    { id: 'all', label: 'Tous les clients', icon: 'Users', count: 48 },
    { id: 'active', label: 'Actifs', icon: 'CheckCircle', count: 42 },
    { id: 'inactive', label: 'Inactifs', icon: 'XCircle', count: 6 },
    { id: 'overdue', label: 'En retard', icon: 'AlertCircle', count: 8 }
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {filters?.map((filter) => (
        <button
          key={filter?.id}
          onClick={() => onFilterChange(filter?.id)}
          className={`
            flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg text-sm font-medium transition-smooth whitespace-nowrap flex-shrink-0
            ${activeFilter === filter?.id
              ? 'bg-primary text-primary-foreground shadow-elevation-1'
              : 'bg-card text-foreground border border-border hover:shadow-elevation-1'
            }
          `}
        >
          <Icon name={filter?.icon} size={16} color="currentColor" />
          <span>{filter?.label}</span>
          <span className={`
            px-2 py-0.5 rounded-full text-xs font-semibold
            ${activeFilter === filter?.id
              ? 'bg-primary-foreground/20 text-primary-foreground'
              : 'bg-muted text-muted-foreground'
            }
          `}>
            {filter?.count}
          </span>
        </button>
      ))}
    </div>
  );
};

export default ClientFilters;