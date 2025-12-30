import React from 'react';
import Icon from '../../../components/AppIcon';

const TaxDeadlinesPanel = ({ deadlines }) => {
  const getUrgencyColor = (daysRemaining) => {
    if (daysRemaining <= 7) return 'var(--color-error)';
    if (daysRemaining <= 14) return 'var(--color-warning)';
    return 'var(--color-success)';
  };

  const getUrgencyBg = (daysRemaining) => {
    if (daysRemaining <= 7) return 'bg-error';
    if (daysRemaining <= 14) return 'bg-warning';
    return 'bg-success';
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-elevation-1 overflow-hidden">
      <div className="p-4 md:p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-lg md:text-xl font-heading font-semibold text-foreground">
            Échéances Fiscales
          </h2>
          <Icon name="Calendar" size={20} color="var(--color-primary)" />
        </div>
      </div>
      <div className="p-4 md:p-6 space-y-3 md:space-y-4">
        {deadlines?.map((deadline) => (
          <div 
            key={deadline?.id}
            className="flex items-start gap-3 md:gap-4 p-3 md:p-4 rounded-lg border border-border hover:shadow-elevation-1 transition-smooth"
          >
            <div 
              className={`flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-lg ${getUrgencyBg(deadline?.daysRemaining)} bg-opacity-10 flex items-center justify-center`}
            >
              <Icon 
                name={deadline?.icon} 
                size={24} 
                color={getUrgencyColor(deadline?.daysRemaining)} 
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm md:text-base font-medium text-foreground mb-1">
                {deadline?.title}
              </h3>
              <p className="text-xs md:text-sm text-muted-foreground mb-2 line-clamp-2">
                {deadline?.description}
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1">
                  <Icon name="Clock" size={14} color="var(--color-muted-foreground)" />
                  <span className="text-xs text-muted-foreground">
                    {deadline?.date}
                  </span>
                </div>
                <span 
                  className="text-xs font-semibold data-text"
                  style={{ color: getUrgencyColor(deadline?.daysRemaining) }}
                >
                  {deadline?.daysRemaining} jours restants
                </span>
              </div>
            </div>
            <button 
              className="flex-shrink-0 p-2 hover:bg-muted rounded-md transition-smooth"
              aria-label="Voir les détails"
            >
              <Icon name="ChevronRight" size={18} color="var(--color-muted-foreground)" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaxDeadlinesPanel;