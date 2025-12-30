import React from 'react';
import Icon from '../../../components/AppIcon';

const MetricCard = ({ title, value, change, changeType, icon, iconColor, trend }) => {
  const getTrendIcon = () => {
    if (changeType === 'positive') return 'TrendingUp';
    if (changeType === 'negative') return 'TrendingDown';
    return 'Minus';
  };

  const getTrendColor = () => {
    if (changeType === 'positive') return 'var(--color-success)';
    if (changeType === 'negative') return 'var(--color-error)';
    return 'var(--color-muted-foreground)';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-elevation-1 hover:shadow-elevation-2 transition-smooth">
      <div className="flex items-start justify-between mb-3 md:mb-4">
        <div className="flex-1">
          <p className="text-sm md:text-base text-muted-foreground mb-1 md:mb-2">{title}</p>
          <p className="text-2xl md:text-3xl lg:text-4xl font-heading font-semibold text-foreground data-text">
            {value}
          </p>
        </div>
        <div 
          className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-lg"
          style={{ backgroundColor: `${iconColor}15` }}
        >
          <Icon name={icon} size={24} color={iconColor} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <Icon name={getTrendIcon()} size={16} color={getTrendColor()} />
          <span 
            className="text-xs md:text-sm font-medium data-text"
            style={{ color: getTrendColor() }}
          >
            {change}
          </span>
        </div>
        <span className="text-xs md:text-sm text-muted-foreground">{trend}</span>
      </div>
    </div>
  );
};

export default MetricCard;