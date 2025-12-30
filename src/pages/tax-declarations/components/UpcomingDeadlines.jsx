import React from 'react';
import Icon from '../../../components/AppIcon';

const UpcomingDeadlines = ({ deadlines }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-error';
      case 'medium':
        return 'text-warning';
      default:
        return 'text-success';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high':
        return 'AlertCircle';
      case 'medium':
        return 'Clock';
      default:
        return 'CheckCircle';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-elevation-1">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading font-semibold text-base md:text-lg text-foreground">
          Échéances à venir
        </h3>
        <Icon name="Calendar" size={20} color="var(--color-primary)" />
      </div>
      <div className="space-y-3">
        {deadlines?.map((deadline, index) => (
          <div
            key={index}
            className="flex items-start gap-3 p-3 bg-muted rounded-md hover:bg-muted hover:shadow-elevation-1 transition-smooth"
          >
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${getPriorityColor(deadline?.priority)} bg-opacity-10 flex-shrink-0`}>
              <Icon
                name={getPriorityIcon(deadline?.priority)}
                size={16}
                color={`var(--color-${deadline?.priority === 'high' ? 'error' : deadline?.priority === 'medium' ? 'warning' : 'success'})`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-foreground mb-1">
                {deadline?.title}
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                <span className="text-xs text-muted-foreground">
                  {new Date(deadline.date)?.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </span>
                <span className={`text-xs font-medium ${getPriorityColor(deadline?.priority)}`}>
                  {deadline?.daysLeft} jours restants
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingDeadlines;