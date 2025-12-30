import React from 'react';
import Icon from '../../../components/AppIcon';

const ReportTypeCard = ({ report, isSelected, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`
        w-full p-4 rounded-lg border transition-smooth text-left
        ${isSelected 
          ? 'bg-primary border-primary shadow-elevation-2' 
          : 'bg-card border-border hover:border-primary hover:shadow-elevation-1'
        }
      `}
      aria-pressed={isSelected}
    >
      <div className="flex items-start gap-3">
        <div className={`
          flex-shrink-0 w-10 h-10 rounded-md flex items-center justify-center
          ${isSelected ? 'bg-primary-foreground/20' : 'bg-muted'}
        `}>
          <Icon 
            name={report?.icon} 
            size={20} 
            color={isSelected ? 'var(--color-primary-foreground)' : 'var(--color-primary)'} 
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`
            font-heading font-semibold text-sm md:text-base mb-1
            ${isSelected ? 'text-primary-foreground' : 'text-foreground'}
          `}>
            {report?.name}
          </h3>
          <p className={`
            text-xs md:text-sm
            ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}
          `}>
            {report?.description}
          </p>
        </div>
      </div>
    </button>
  );
};

export default ReportTypeCard;