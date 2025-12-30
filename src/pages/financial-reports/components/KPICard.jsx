import React from 'react';
import Icon from '../../../components/AppIcon';

const KPICard = ({ kpi }) => {
  const getTrendColor = () => {
    if (kpi?.trend === 'up') {
      return kpi?.isPositive ? 'text-success' : 'text-error';
    }
    return kpi?.isPositive ? 'text-error' : 'text-success';
  };

  const getTrendIcon = () => {
    return kpi?.trend === 'up' ? 'TrendingUp' : 'TrendingDown';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-elevation-1 hover:shadow-elevation-2 transition-smooth">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <p className="text-xs md:text-sm text-muted-foreground mb-1">{kpi?.label}</p>
          <p className="text-xl md:text-2xl lg:text-3xl font-heading font-bold text-foreground data-text">
            {kpi?.value}
          </p>
        </div>
        <div className={`
          w-10 h-10 md:w-12 md:h-12 rounded-md flex items-center justify-center
          ${kpi?.trend === 'up' ? kpi?.isPositive ?'bg-success/10': 'bg-error/10' : kpi?.isPositive ?'bg-error/10' : 'bg-success/10'
          }
        `}>
          <Icon 
            name={getTrendIcon()} 
            size={20} 
            color={getTrendColor()?.replace('text-', 'var(--color-)')} 
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-sm md:text-base font-medium ${getTrendColor()}`}>
          {kpi?.change}
        </span>
        <span className="text-xs md:text-sm text-muted-foreground">vs période précédente</span>
      </div>
    </div>
  );
};

export default KPICard;